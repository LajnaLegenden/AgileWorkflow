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
            socket.on('newTask', async (data) => {
                await Storage.addTask(data);
                let LOG =log("addedTask", data);
                io.emit('goUpdate', data);
                await Storage.addLog(LOG, data.projectID)
                io.emit('log', LOG);
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
                let comments = await Storage.getAllComments(task[0].id);
                io.to(socket.id).emit('infoAboutTask', {task:task[0], comments});
            });

            socket.on('addProject', async  data => {
                data.creator = user.user;
                await Storage.addProject(data);
            });
            socket.on("addComment", async data => {
                data.author = user.user;
                data.postDate = new Date();
                checkIfNote(data.content);
                await Storage.addComment(data);
                io.emit("showComment", data)
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
        function checkIfNote(string){
            return string.split("@")[1].split(" ");
        }
    });
}
