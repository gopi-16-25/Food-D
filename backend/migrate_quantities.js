const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const donationSchema = new mongoose.Schema({
    quantity: mongoose.Schema.Types.Mixed
});

const Donation = mongoose.model('Donation', donationSchema);

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const donations = await Donation.find({});
        console.log(`Found ${donations.length} donations to check`);

        for (let donation of donations) {
            if (typeof donation.quantity === 'string') {
                const numericPart = donation.quantity.match(/[\d.]+/);
                if (numericPart) {
                    const newValue = parseFloat(numericPart[0]);
                    console.log(`Migrating "${donation.quantity}" -> ${newValue}`);
                    donation.quantity = newValue;
                    await donation.save();
                } else {
                    console.log(`Could not parse numeric value from "${donation.quantity}", setting to 1`);
                    donation.quantity = 1;
                    await donation.save();
                }
            }
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
