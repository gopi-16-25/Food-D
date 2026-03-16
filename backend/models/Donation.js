const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    foodType: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    requestedQuantity: {
        type: Number,
        default: 0,
    },
    image: {
        type: String, // URL/Path to the image
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
        address: String,
    },
    recipientLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        },
        address: String,
    },
    status: {
        type: String,
        enum: ['posted', 'pending_approval', 'requested', 'assigned', 'picked', 'delivered', 'completed', 'expired'],
        default: 'posted',
    },
    parentDonation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        default: null
    },
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    volunteerCommitment: {
        pickupDeadline: Date,
        deliveryDeadline: Date,
    },
    pickupOtp: {
        code: String,
        generatedAt: Date,
        expiresAt: Date,
        verified: {
            type: Boolean,
            default: false
        }
    },
    deliveryOtp: {
        code: String,
        generatedAt: Date,
        expiresAt: Date,
        verified: {
            type: Boolean,
            default: false
        }
    },
    // Timestamps for status changes
    assignedAt: Date,
    pickedAt: Date,
    deliveredAt: Date,
    completedAt: Date
}, { timestamps: true });

DonationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Donation', DonationSchema);
