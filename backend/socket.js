const { Server } = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST", "PUT", "DELETE"],
                credentials: true
            }
        });

        io.on('connection', (socket) => {
            console.log('🔌 Socket connected:', socket.id);

            // Join a private room for targeted notifications
            socket.on('join', (userId) => {
                socket.join(userId);
                console.log(`👤 User ${userId} joined their private room`);
            });

            socket.on('disconnect', () => {
                console.log('❌ Socket disconnected:', socket.id);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
