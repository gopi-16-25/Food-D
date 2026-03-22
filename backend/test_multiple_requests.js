const mongoose = require('mongoose');
require('dotenv').config();
const Donation = require('./models/Donation');
const socket = require('./socket');
const { requestDonation } = require('./controllers/donationController');

// Mock getIO before anything else
socket.getIO = () => {
    console.log("Mock getIO called");
    return {
        to: (room) => {
            console.log(`Mock to room: ${room}`);
            return {
                emit: (event, data) => console.log(`Mock emit ${event} to room ${room}`)
            };
        },
        emit: (event, data) => console.log(`Mock emit ${event} globally`)
    };
};

async function testMultipleRequests() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const donorId = new mongoose.Types.ObjectId(); 
        const recipientId = new mongoose.Types.ObjectId();

        console.log("Creating parent donation...");
        const parent = await Donation.create({
            donor: donorId,
            foodType: "Multi-Request Pizza",
            quantity: 20,
            expiryDate: new Date(Date.now() + 86400000),
            image: "test.jpg",
            location: { type: 'Point', coordinates: [0, 0], address: "Test St" },
            status: 'posted'
        });
        console.log(`Created parent: ${parent._id}`);

        const resMock = {
            status: function(code) {
                console.log(`Status code: ${code}`);
                return this;
            },
            json: function(data) {
                console.log("JSON Response:", JSON.stringify(data, null, 2));
                return this;
            }
        };

        console.log("\n--- Request 1 ---");
        const req1 = {
            params: { id: parent._id },
            body: { location: [0, 0], address: "Req St", requestedQuantity: 5 },
            user: { _id: recipientId, role: 'recipient' }
        };
        await requestDonation(req1, resMock);

        console.log("\n--- Request 2 ---");
        const req2 = {
            params: { id: parent._id },
            body: { location: [0, 0], address: "Req St", requestedQuantity: 3 },
            user: { _id: recipientId, role: 'recipient' }
        };
        await requestDonation(req2, resMock);

        console.log("\n--- Verification ---");
        const subRequests = await Donation.find({ parentDonation: parent._id });
        console.log(`Total sub-requests created: ${subRequests.length}`);

        if (subRequests.length === 2) {
            console.log("VERIFICATION SUCCESSFUL: Multiple requests allowed.");
        } else {
            console.log("VERIFICATION FAILED: Multiple requests blocked.");
        }

        // Cleanup
        await Donation.deleteMany({ $or: [{ _id: parent._id }, { parentDonation: parent._id }] });
        console.log("Cleanup complete");
        process.exit(0);

    } catch (error) {
        console.error("\n!!! TEST ERROR !!!");
        console.error(error);
        process.exit(1);
    }
}

testMultipleRequests();
