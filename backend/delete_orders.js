const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Donation = require('./models/Donation');

dotenv.config();

const deleteAllDonations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const result = await Donation.deleteMany({});
        console.log(`Deleted ${result.deletedCount} donation records.`);

        process.exit(0);
    } catch (error) {
        console.error('Error deleting donations:', error);
        process.exit(1);
    }
};

deleteAllDonations();
