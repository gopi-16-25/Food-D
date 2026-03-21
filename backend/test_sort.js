require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./models/Donation');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const activeDeliveries = await Donation.find({ status: { $in: ['assigned', 'picked'] } }).sort({ updatedAt: -1 });
  console.log("=== DESCENDING (-1) ===");
  activeDeliveries.forEach(d => console.log(d.foodType, d.updatedAt.toISOString(), d.status));
  process.exit();
}
test();
