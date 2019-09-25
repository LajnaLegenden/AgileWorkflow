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

    let allUsersOnline = [];

    let online = 0;
    io.on('connection', (socket) => {
        //Make sure no non auth users are here (they should have dc)

        user = socketioAuth(socket);
        socket.user = user.user;
        //Online user with timeout to not add non auth people to the list
        setTimeout(() => {
            io.emit('onlinePeople', ++online);
        }, 100);
        socket.on('disconnect', () => {
            for (var i = 0; i < allUsersOnline.length; i++) {
                if (allUsersOnline[i] === socket) {
                    allUsersOnline.splice(i, 1);
                    console.log(allUsersOnline.length)

                }
            }
            setTimeout(() => {
                io.emit('onlinePeople', --online);
            }, 100);
        })
        allUsersOnline.push(socket);
        console.log(allUsersOnline.length)
        if (socket.user !== "{}" || socket.user == undefined) {
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
                for (let i = 0; i < tasks.length; i++) {
                    tasks[i].notes = (await Storage.getAllUserNotesWithTask(socket.user, tasks[i].id)).length;
                    if (tasks[i].notes == 0) tasks[i].notes = "";
                }
                let logs = await Storage.getAllLogs(projectID);
                io.to(socket.id).emit("updateLog", logs)
                io.to(socket.id).emit('allTasks', tasks);
            });
            //Update the moved task in the db and tell clients that the task has moved
            //Only moves the task to save on network
            socket.on('moveTask', async data => {
                await Storage.updateState(data);
                let task = await Storage.getTask(data.id);
                socket.broadcast.emit('moveThisTask', data);
                data.name = task[0].name
                let LOG = log('move', data);
                io.emit('log', LOG)

                await Storage.addLog(LOG, data.projectID)
            });
            //Gets the data for the task to show in the description box
            socket.on('moreInfo', async (id) => {
                let task = await Storage.getTask(id);
                Storage.deleteUserNotes(task[0].id);
                let comments = await Storage.getAllComments(task[0].id);
                io.to(socket.id).emit('infoAboutTask', { task: task[0], comments });
                updateProjects();
                io.to(socket.id).emit("goUpdate")
            });
            //Makes a new projects
            socket.on('addProject', async  data => {
                data.creator = user.user;
                await Storage.addProject(data);
                io.to(socket.id).emit('allGood');
                let projects = await Storage.getAllProjects(socket.user);
                for (let i = 0; i < projects.length; i++) {
                    projects[i].notes = (await Storage.getAllUserNotes(socket.user, projects[i].id)).length;
                    if (projects[i].notes == 0) projects[i].notes = "";
                }
                io.to(socket.id).emit('yourProjects', projects);

            });
            socket.on("addComment", async data => {
                data.author = socket.user;
                data.postDate = new Date();
                data.userNote = checkIfNote(data.content) || [];
                data.userNote.forEach(async userTagged => {
                    console.log("eherer", data.taskID)
                    await Storage.addUserNote(userTagged, user.user, data.projectID, data.taskID);
                    for (let i in allUsersOnline) {
                        console.log(allUsersOnline[i] == userTagged);
                        if (allUsersOnline[i] == userTagged) {
                            io.to(allUsersOnline[i].id).emit('goUpdate');
                        }
                    }
                });
                await Storage.addComment(data);
                io.emit("showComment", data);
                updateProjects();
                io.emit("goUpdate")
            });
            socket.on('myProjects', async () => {
                let projects = await Storage.getAllProjects(socket.user);
                for (let i = 0; i < projects.length; i++) {
                    projects[i].notes = (await Storage.getAllUserNotes(socket.user, projects[i].id)).length;
                    if (projects[i].notes == 0) projects[i].notes = "";
                }
                io.to(socket.id).emit('yourProjects', projects);
            });
            socket.on("addUser", async data => {
                for (let i in data.users) {
                    if ((await Storage.getUserProject({ username: data.toUser, projectID: data.projectID })).length == 0)
                        await Storage.sendInvite({ fromUser: socket.user, toUser: data.users[i], projectID: data.projectID });
                }
                io.to(socket.id).emit('allGood');
            });
            socket.on("acceptProjectInvite", async data => {
                let invite = (await Storage.getProjectInvite(data))[0];
                await Storage.addUserProject({ username: socket.user, projectID: invite.projectID })
                await Storage.deleteProjectInvite(invite.id);
                await updateProjects();
            });
            socket.on("declineProjectInvite", async data => {
                let invite = (await Storage.getProjectInvite(data))[0];
                await Storage.deleteProjectInvite(invite.id);
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
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${hours}.${minutes}.${seconds}]</span> <b>@${socket.user}</b> moved ${data.name} to ${data.state}</div>`;
                case 'addedTask':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${hours}.${minutes}.${seconds}]</span> <b>@${socket.user}</b> created a task called "${data.name}"</div>`;
            }
        }
        function checkIfNote(string) {
            let users = [];
            if (!string.includes("@")) return "";
            while (string.includes("@")) {
                users.push(string.split("@")[1].split(" ")[0]);
                string = string.substring(string.indexOf('@') + 1);
            }
            return users;
        }

        async function updateProjects() {
            let projects = await Storage.getAllProjects(socket.user);
            for (let i = 0; i < projects.length; i++) {
                projects[i].notes = (await Storage.getAllUserNotes(socket.user, projects[i].id)).length;
                if (projects[i].notes == 0) projects[i].notes = "";
            }
            io.to(socket.id).emit('yourProjects', projects);
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
        user = Buffer.from(cookies['express:sess'], 'base64').toString();
    } catch (err) {
        console.log(err);
        socket.disconnect(true)
        return;
    }
    if (user == "{}" && JSON.parse(user) == undefined)
        socket.disconnect(true);
    return JSON.parse(user);
}