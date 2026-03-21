const mongoose = require('mongoose');
require('dotenv').config();
const Donation = require('./models/Donation');
const { handleRequestAction } = require('./controllers/donationController');

async function verify() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const donorId = "69bed8e757bb8a6b0154d4bd"; // Real donor from DB
    
    // 1. Create a dummy parent donation
    const parent = await Donation.create({
        donor: donorId,
        foodType: "Test Pizza",
        quantity: 10,
        expiryDate: new Date(Date.now() + 86400000),
        image: "test.jpg",
        location: { type: 'Point', coordinates: [0, 0], address: "Test St" },
        status: 'posted'
    });
    console.log(`Created parent: ${parent._id}`);

    // 2. Create a sub-request for 10 units
    const sub = await Donation.create({
        donor: donorId,
        recipient: donorId, // just for test
        foodType: "Test Pizza",
        quantity: 10,
        expiryDate: parent.expiryDate,
        image: "test.jpg",
        location: parent.location,
        status: 'pending_approval',
        parentDonation: parent._id
    });
    console.log(`Created sub-request: ${sub._id}`);

    // 3. Mock req/res for handleRequestAction
    const req = {
        params: { id: sub._id },
        body: { action: 'approve' },
        user: { _id: donorId, role: 'donor' }
    };
    const res = {
        status: () => res,
        json: (data) => {
            console.log("Response:", data.message);
            return res;
        }
    };

    // 4. Run the controller function
    await handleRequestAction(req, res);

    // 5. Verify results
    const updatedParent = await Donation.findById(parent._id);
    const updatedSub = await Donation.findById(sub._id);

    console.log(`Final Parent Qty: ${updatedParent.quantity} (Expected: 0)`);
    console.log(`Final Parent Status: ${updatedParent.status} (Expected: completed)`);
    console.log(`Final Sub Status: ${updatedSub.status} (Expected: requested)`);

    if (updatedParent.quantity === 0 && updatedParent.status === 'completed') {
        console.log("VERIFICATION SUCCESSFUL");
    } else {
        console.log("VERIFICATION FAILED");
    }

    // Cleanup
    await Donation.findByIdAndDelete(parent._id);
    await Donation.findByIdAndDelete(sub._id);
    process.exit(0);
}

verify().catch(err => {
    console.error(err);
    process.exit(1);
});
