const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Donation = require('../models/Donation');
const socket = require('../socket'); // Import socket instance
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Google Login & Send OTP
exports.googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        // Check admin
        const isAdmin = email === process.env.ADMIN_EMAIL;

        // Create user if not exists
        if (!user) {
            user = await User.create({
                name,
                email,
                avatar: picture,
                role: isAdmin ? 'admin' : 'donor',
                isProfileComplete: isAdmin,
                isVerified: true, // ✅ directly verified
            });
        }

        // Ensure admin role consistency
        if (isAdmin && user.role !== 'admin') {
            user.role = 'admin';
            user.isProfileComplete = true;
            user.isVerified = true;
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // ✅ Direct login response (NO OTP)
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            isProfileComplete: user.isProfileComplete,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(500).json({
            message: 'Google authentication failed',
            error: error.message,
        });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp && user.otp.code === otp && user.otp.expiresAt > Date.now()) {
            user.otp = undefined;
            user.isVerified = true;
            user.lastLogin = new Date();

            // Strict Admin Enforcement
            if (user.email === process.env.ADMIN_EMAIL && user.role !== 'admin') {
                user.role = 'admin';
                user.isProfileComplete = true;
            }

            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                isProfileComplete: user.isProfileComplete,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update User Role
exports.updateRole = async (req, res) => {
    const { role } = req.body;
    const userId = req.user.id;

    try {
        console.log("🔁 Role change request:", role);

        const validRoles = ['donor', 'recipient', 'volunteer'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ❌ Admin cannot change
        if (user.email === process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Admin role cannot be changed.' });
        }

        console.log("👤 Current role:", user.role);

        // ✅ Optional: prevent same role update
        if (user.role === role) {
            return res.json(user);
        }

        // 🔥 OPTIONAL SAFETY CHECK (IMPORTANT)
        const activeDonations = await Donation.find({
            $or: [
                { donor: user._id },
                { volunteer: user._id },
                { recipient: user._id }
            ],
            status: { $in: ['assigned', 'picked'] }
        });

        if (activeDonations.length > 0) {
            return res.status(400).json({
                message: 'Cannot change role while you have active tasks'
            });
        }

        // ✅ Allow role change
        user.role = role;
        user.isProfileComplete = true;

        await user.save();

        console.log("✅ Role updated to:", role);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            isProfileComplete: user.isProfileComplete,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error("🔥 Role update error:", error);
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-otp -otpExpires');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    console.log("📥 [updateProfile] Request received");
    console.log("👤 User ID from token:", req.user?.id);
    console.log("📦 Request body:", req.body);

    try {
        const user = await User.findById(req.user.id);

        console.log("🔍 User fetched from DB:", user ? user._id : "NOT FOUND");

        if (!user) {
            console.log("❌ User not found in DB");
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, phone, socialLinks, avatar } = req.body;

        console.log("🛠️ Updating fields:", {
            name,
            phone,
            socialLinks,
            avatar
        });

        // Apply updates
        if (name) user.name = name;

        if (phone !== undefined) {
            user.phone = phone === '' ? undefined : phone;
        }

        if (avatar !== undefined) user.avatar = avatar;

        if (socialLinks) {
            user.socialLinks = { ...user.socialLinks, ...socialLinks };
        }

        console.log("💾 Saving user...");
        const updatedUser = await user.save();

        console.log("✅ User saved successfully:", updatedUser._id);

        // REAL-TIME UPDATE
        try {
            console.log("📡 Fetching active donations for socket update...");

            const activeDonations = await Donation.find({
                $or: [
                    { donor: user._id },
                    { volunteer: user._id },
                    { recipient: user._id }
                ],
                status: { $in: ['posted', 'requested', 'assigned', 'picked'] }
            });

            console.log("📊 Active donations count:", activeDonations.length);

            const io = socket.getIO();

            activeDonations.forEach(donation => {
                console.log("📡 Emitting donationUpdated for:", donation._id);

                io.emit('donationUpdated', {
                    donationId: donation._id,
                    status: donation.status
                });
            });

            console.log("📡 Emitting userUpdated event");

            io.emit('userUpdated', {
                _id: updatedUser._id,
                name: updatedUser.name,
                avatar: updatedUser.avatar,
                phone: updatedUser.phone
            });

        } catch (socketError) {
            console.error("⚠️ Socket error (non-fatal):", socketError.message);
        }

        console.log("📤 Sending response to frontend");

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            isProfileComplete: updatedUser.isProfileComplete,
            socialLinks: updatedUser.socialLinks
        });

    } catch (error) {
        console.error("🔥 [updateProfile ERROR]:", error);
        res.status(500).json({ message: error.message });
    }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate New OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = {
            code: otpCode,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        };
        await user.save();

        // Send OTP via Email
        await transporter.sendMail({
            from: '"Food Donation App" <no-reply@fooddonation.com>',
            to: email,
            subject: 'Your Login OTP (Resent)',
            html: `<h2>Your new OTP is ${otpCode}</h2><p>Valid for 5 minutes</p>`,
        });

        res.status(200).json({ message: 'New OTP sent to email', email });
    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({ message: 'Failed to resend OTP' });
    }
};
