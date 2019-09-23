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
    let online = 0;
    io.on('connection', (socket) => {
        //Online user with timeout to not add non auth people to the list
        setTimeout(() => {
            io.emit('onlinePeople', ++online);
        }, 100);
        socket.on('disconnect', () => {
            setTimeout(() => {
                io.emit('onlinePeople', --online);
            }, 100);
        })
        //Make sure no non auth users are here (they should have dc)
        user = socketioAuth(socket);
        if (user !== "{}" || user == undefined) {
            //New task
            socket.on('newTask', async (data) => {
                await Storage.addTask(data);
                let LOG = log("addedTask", data);
                io.emit('goUpdate', data);
                await Storage.addLog(LOG, data.projectID)
                io.emit('log', LOG);
            });
            //Send all task for a certain project id
            socket.on('needTasks', async (projectID) => {
                let tasks = await Storage.getAllTasks(projectID);
                io.to(socket.id).emit('allTasks', tasks);
            });
            //Update the moved task in the db and tell clients that the task has moved
            //Only moves the task to save on network
            socket.on('moveTask', async data => {
                await Storage.updateState(data);
                socket.broadcast.emit('moveThisTask', data);
                let LOG = log('move', data);
                io.emit('log', LOG)
                await Storage.addLog(LOG, data.projectID)
            });
            //Gets the data for the task to show in the description box
            socket.on('moreInfo', async (id) => {
                let task = await Storage.getTask(id);
                let comments = await Storage.getAllComments(task[0].id);
                io.to(socket.id).emit('infoAboutTask', {task:task[0], comments});
            });
            //Makes a new projects
            socket.on('addProject', async  data => {
                data.creator = user.user;
                await Storage.addProject(data);
                io.to(socket.id).emit('allGood');
            });
            socket.on("addComment", async data => {
                data.author = user.user;
                data.postDate = new Date();
                data.userNote = checkIfNote(data.content);
                await Storage.addUserNote(data.userNote, user.user, data.taskID, data.projectID);
                await Storage.addComment(data);
                io.emit("showComment", data)
            });
        }
        //Logs stuff in a pretty manner
        function log(action, data) {
            let d = new Date();
            let hours = d.getHours().toString();
            let minutes = d.getMinutes().toString()
            let seconds = d.getSeconds().toString()
            if (hours.length == 1) {
                hours += "0";
                hours = hours.split("").reverse().join("");
            }
            if (minutes.length == 1) {
                minutes += "0";
                minutes = minutes.split("").reverse().join("");
            }
            if (seconds.length == 1) {
                seconds += "0";
                seconds = seconds.split("").reverse().join("");
            }
            switch (action) {
                case 'move':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${hours}.${minutes}.${seconds}]</span> <b>@${user.user}</b> moved ${data.id} to ${data.state}</div>`;
                case 'addedTask':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${hours}.${minutes}.${seconds}]</span> <b>@${user.user}</b> created a task called "${data.name}"</div>`;
            }
        }
        function checkIfNote(string){
            if(!string.includes("@")) return "";
            else return string.split("@")[1].join("");
        }
    });

}
//Checks cookie for atuh
function socketioAuth(socket) {
    var cookief = socket.handshake.headers.cookie;
    let cookies;
    let user;
    try {
        cookies = cookie.parse(socket.handshake.headers.cookie);
        user = new Buffer(cookies['express:sess'], 'base64').toString();
    } catch (err) {
        console.log(err);
        socket.disconnect(true)
        return;
    }

    if (user == "{}")
        socket.disconnect(true);
    return JSON.parse(user);
}