require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ name: /MUHAIDEEN/i });
  if (!user) {
    console.log("User not found");
    process.exit();
  }
  const activeDeliveries = await Donation.find({
      volunteer: user._id,
      status: { $in: ['assigned', 'picked'] }
  }).sort({ updatedAt: -1 });
  
  const fs = require('fs');
  fs.writeFileSync('volunteer_sort.json', JSON.stringify(activeDeliveries.map(d => ({ 
    food: d.foodType, 
    updated: d.updatedAt,
    deadline: d.volunteerCommitment?.pickupDeadline || d.volunteerCommitment?.deliveryDeadline
  })), null, 2));
  process.exit();
}
test();
