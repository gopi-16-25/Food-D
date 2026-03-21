const mongoose = require('mongoose');
require('dotenv').config();
const Donation = require('./models/Donation');
const fs = require('fs');

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const docs = await Donation.find({});
    
    const results = docs.map(d => ({
        id: d._id,
        donor: d.donor,
        food: d.foodType,
        qty: d.quantity,
        status: d.status,
        parent: d.parentDonation,
        createdAt: d.createdAt
    }));

    fs.writeFileSync('debug_output.json', JSON.stringify(results, null, 2), 'utf8');
    process.exit(0);
}

debug();
