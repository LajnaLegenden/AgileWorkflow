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
            Storage.addTask(data);
            io.emit('goUpdate');
        });

        socket.on('needTasks', async () => {
            let tasks = await Storage.getAllTasks();
            io.to(socket.id).emit('allTasks', tasks);
        });

        socket.on('moveTask', async (data) => {
            await Storage.updateState(data);
            io.emit('goUpdate');
        });

        socket.on('moreInfo', async (id) => {
            let task = await Storage.getTask(id);
            io.to(socket.id).emit('infoAboutTask', task);
        });
    });

}