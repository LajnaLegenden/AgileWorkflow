const sIO = require('socket.io');
const Storage = require("./storage.js");

let io;

module.exports = (app) => {
    io = sIO.listen(app);
    socketIO();
}

function socketIO() {
    io.on('connection', (socket) => {
        //Check auth
        socket.on('newTask', (data) => {
            Storage.addTask(data)
        });
    });

}