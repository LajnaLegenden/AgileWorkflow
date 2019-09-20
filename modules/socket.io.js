const sIO = require('socket.io');
const Storage = require("./storage.js");
const cookie = require('cookie');
const sharedsession = require("express-socket.io-session");


let io;

module.exports = (https, cookie) => {
    io = sIO.listen(https);
    io.use(sharedsession(cookie, {
        autoSave: true
    }));
    socketIO();
}

function socketIO() {
    io.on('connection', (socket) => {
        var cookief = socket.handshake.headers.cookie;
        let cookies;
        try {
            cookies = cookie.parse(socket.handshake.headers.cookie);
        } catch (error) {
        }

        let user = new Buffer(cookies['express:sess'], 'base64').toString();
        user = JSON.parse(user);
        if (user !== "{}" || user == undefined) {
            socket.user = user.user
            socket.on('newTask', (data) => {
                Storage.addTask(data);
                io.emit('goUpdate');
            });
            socket.on('needTasks', async () => {
                let tasks = await Storage.getAllTasks();
                io.to(socket.id).emit('allTasks', tasks);
            });

            // socket.on('moveTask', async (data) => {
            //     await Storage.updateState(data);
            //     io.emit('goUpdate');
            //     io.emit('log', log('move')
            // });

            socket.on('moreInfo', async (id) => {
                let task = await Storage.getTask(id);
                io.to(socket.id).emit('infoAboutTask', task);
            });

            socket.on('addProject', async  data => {
                data.creator = socket.user;
                await Storage.addProject(data);
                io.emit('log', `@${socket.user} created a project called ${data.name}`);
                io.to(socket.id).emit('allGood');
            });
        }
    });
}

// function log(action, data){
//     switch (action){
//         case 'move'
//     }
// }