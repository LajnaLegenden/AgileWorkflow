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
<<<<<<< HEAD
            socket.on('newTask', async (data) => {
                await Storage.addTask(data);
                io.emit('goUpdate', data);
                io.emit('log', log("addedTask", data));
=======
            socket.user = user.user
            socket.on('newTask', (data) => {
                Storage.addTask(data);
                io.emit('goUpdate');
>>>>>>> cdf869d7e952dae3428fe668cfd941e6689c219b
            });
            socket.on('needTasks', async (projectID) => {
                let tasks = await Storage.getAllTasks(projectID);
                io.to(socket.id).emit('allTasks', tasks);
            });

            socket.on('moveTask', async data => {
                await Storage.updateState(data);
                io.emit('goUpdate', data);
                let LOG = log('move', data);
                io.emit('log', LOG)
                await Storage.addLog(LOG, data.projectID)
            });

            socket.on('moreInfo', async (id) => {
                let task = await Storage.getTask(id);
                io.to(socket.id).emit('infoAboutTask', task);
            });

            socket.on('addProject', async  data => {
                data.creator = socket.user;
                await Storage.addProject(data);
<<<<<<< HEAD
=======
                io.emit('log', `@${socket.user} created a project called ${data.name}`);
                io.to(socket.id).emit('allGood');
>>>>>>> cdf869d7e952dae3428fe668cfd941e6689c219b
            });
        }
        function log(action, data) {
            let d = new Date();
            let hours = d.getHours().toString();
            let minutes = d.getMinutes().toString()
            let seconds = d.getSeconds().toString()
            if(hours.length == 1){
                hours += "0";
                hours = hours.split("").reverse().join("");
            }
            if(minutes.length == 1){
                minutes += "0";
                minutes = minutes.split("").reverse().join("");
            }
            if(seconds.length == 1){
                seconds += "0";
                seconds = seconds.split("").reverse().join("");
            }
            switch (action) {
                case 'move':
                    return  `<div><span style="background-color:lightgrey; border-radius:2px;">[${hours}.${minutes}.${seconds}]</span> <b>@${user.user}</b> moved ${data.id} to ${data.state}</div>`;
                case 'addedTask':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${hours}.${minutes}.${seconds}]</span> <b>@${user.user}</b> created a task called "${data.name}"</div>`;
            }
        }
    });
}
