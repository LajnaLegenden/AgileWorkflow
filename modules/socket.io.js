const sIO = require('socket.io');

let io;

module.exports = (app) => {
    io = sIO.listen(app);
    socketIO();
}

function socketIO() {
    io.on('connection', (socket) => {
        //Check auth
socket.on('newTask', (data) => {
    console.log(data);
})
    });
}