require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./models/Donation');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const activeDeliveries = await Donation.find({ status: { $in: ['assigned', 'picked'] } }).sort({ updatedAt: -1 });
  const fs = require('fs');
  fs.writeFileSync('clean.json', JSON.stringify(activeDeliveries.map(d => ({ food: d.foodType, updated: d.updatedAt })), null, 2));
  process.exit();
}
test();
