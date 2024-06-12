const socketIO = require('socket.io');

const createSocketServer = (server) => {
    const io = socketIO(server);

    io.on('connection', (socket) => {

        socket.on('start', (data) => {
            socket.broadcast.emit("start", data)
        });

        socket.on('offer', (data) => {
            socket.broadcast.emit("offer", data)
        });

        socket.on('answer', (data) => {
            socket.broadcast.emit("answer", data)
        });

        socket.on('candidate', (data) => {
            socket.broadcast.emit("candidate", data)
        });

        socket.on('disconnect', () => {
            // console.log('A client disconnected:', socket.id);
        });
    });

    return io;
};

module.exports = createSocketServer;
