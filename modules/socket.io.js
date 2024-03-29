const sIO = require('socket.io');
const Storage = require('./storage.js');
const cookie = require('cookie');
const sharedsession = require('express-socket.io-session');
let wh = require('./webhook');

function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    const reg = /[&<>"'/]/gi;
    return string.replace(reg, match => map[match]);
}
let io;

module.exports = (cookie, app) => {
    io = sIO(app);
    io.use(
        sharedsession(cookie, {
            autoSave: true
        })
    );
    socketIO();
};

function socketIO() {
    let allUsersOnline = [];
    io.on('connection', async socket => {
        allUsersOnline.push(socket);
        io.emit('onlinePeople', allUsersOnline.length);

        //Make sure no non auth users are here (they should have dc)
        user = socketioAuth(socket);
        if (!user) {
            socket.disconnect(true);
            return false;
        }
        if (user.user != undefined) socket.user = sanitize(user.user);

        socket.on('disconnect', disconnect);

        async function disconnect() {
            removeSocket(socket);
        }

        if (socket.user !== '{}' || socket.user != undefined) {
            io.to(socket.id).emit('goUpdate');
            socket.on('newTask', newTask);
            socket.on('editTask', editTask);
            socket.on('needTasks', needTasks);
            socket.on('currentProject', currentProject);
            socket.on('moveTask', moveTask);
            socket.on('moreInfo', moreInfo);
            socket.on('addProject', addProject);
            socket.on('addComment', addComment);
            socket.on('myProjects', myProjects);
            socket.on('addUser', addUser);
            socket.on('addFriend', addFriend);
            socket.on('acceptProjectInvite', acceptProjectInvite);
            socket.on('declineProjectInvite', declineProjectInvite);
            socket.on('acceptFriendRequest', acceptFriendRequest);
            socket.on('declineFriendRequest', declineFriendRequest);
            socket.on('newChat', newChat);
            socket.on('addMessage', sendMessage);
            socket.on('removeTask', removeTask);
            socket.on('updateNotesList', updateNotesList);
            socket.on('removeMessageNotes', removeMessageNotes);
            socket.on('getFriendNotes', getFriendNotes);
            socket.on('removeFriend', removeFriend);
            socket.on('removeProject', removeProject);
            socket.on('asignUserInfo', asignUserInfo);
            socket.on('asignUser', asignUser);
            socket.on('newEvent', newEvent);
            socket.on('updateCalendar', updateCalendar);
            socket.on('removeThisEvent', removeThisEvent);
            socket.on('removeUserAssign', removeUserAssign);
            socket.on('newWebhook', newWebhook);
            socket.on('getWebhooks', getWebhooks);
            socket.on('removeWebhook', removeWebhook);

            /**
             * Adds a new task
             * @param {object} data - The data of the new Task
             */

            async function newTask(data) {
                await Storage.addTask(data);
                let LOG = log('addedTask', data);
                io.to(data.projectID).emit('goUpdate', data);
                await Storage.addLog(LOG, data.projectID);
                io.to(data.projectID).emit('log', LOG);
            }
            async function editTask(data) {
                let LOG = log('edit', { user: socket.user, name: data.name });
                io.to(data.projectID).emit('log', LOG);
                await Storage.addLog(LOG, data.projectID);
                await Storage.editTask(data);
                io.to(data.projectID).emit('goUpdate');
            }

            /**
             * Gets the Tasks for a project with a ceratin prjectID
             * @param {string} projectID - The ID of the requested projects
             */

            async function needTasks(projectID) {
                let tasks = await Storage.getAllTasks(projectID);
                currentProject(projectID);
                if (tasks == undefined) return false;
                for (let i = 0; i < tasks.length; i++) {
                    tasks[i].notes = (
                        await Storage.getAllUserNotesWithTask(
                            socket.user,
                            tasks[i].id
                        )
                    ).length;
                    let asignedUser = await Storage.getTaskAsignByTaskID(
                        tasks[i].id
                    );
                    for (prop of asignedUser) {
                        var username = prop.username;
                    }
                    let projectAsign = await Storage.getProjectAsign({
                        projectID,
                        username
                    });
                    if (asignedUser.length > 0)
                        tasks[
                            i
                        ].asignColor = `rgba(${projectAsign[0].R},${projectAsign[0].G},${projectAsign[0].B}, 0.6)`;
                    if (tasks[i].notes == 0) tasks[i].notes = '';
                }
                let logs = await Storage.getAllLogs(projectID);
                io.to(socket.id).emit('updateLog', logs);
                io.to(socket.id).emit('allTasks', tasks);
            }

            /**
             * Sets the sockets current prject
             * @param {string} id - The current procect that the socket is in
             */

            async function currentProject(id) {
                let project = await Storage.getProject(id);
                let oldProject = socket.currentProject;
                socket.currentProject = id;
                socket.join(id);

                function online(id) {
                    let online = 0;
                    for (let i in allUsersOnline) {
                        if (allUsersOnline[i].currentProject == id) online++;
                    }
                    return online;
                }
                io.to(id).emit('onlinePeople', online(id));
                io.to(oldProject).emit('onlinePeople', online(oldProject));
                io.to(socket.id).emit(
                    'areYouAdmin',
                    (await project[0].creator) == socket.user
                );
            }

            /**
             * Moves a task
             * @param {object} data - Information about the task to move
             */

            async function moveTask(data) {
                await Storage.updateState(data);
                let task = await Storage.getTask(data.id);
                socket.broadcast.emit('moveThisTask', data);
                data.name = task[0].name;
                let LOG = log('move', data);
                io.to(data.projectID).emit('log', LOG);
                await Storage.addLog(LOG, data.projectID);
            }

            /**
             * Gets more info about a ceratin task
             * @param {string} id - The id of the task you would like to know more about
             */

            async function moreInfo(id) {
                let task = await Storage.getTask(id);
                Storage.deleteUserNotes(task[0].id);
                let comments = await Storage.getAllComments(task[0].id);
                let assigned = await Storage.getTaskAsignByTaskID(id);
                io.to(socket.id).emit('infoAboutTask', {
                    task: task[0],
                    comments,
                    assigned
                });
                updateProjects();
                io.to(socket.id).emit('updateCurrentTask');
            }

            /**
             * Creates a new project
             * @param {object} data - Infomation about the new project
             */

            async function addProject(data) {
                data.creator = socket.user;
                await Storage.addProject(data);
                io.to(socket.id).emit('allGood');
                let projects = await Storage.getAllProjects(socket.user);
                for (let i = 0; i < projects.length; i++) {
                    projects[i].notes = (
                        await Storage.getAllUserNotesWithProject(
                            socket.user,
                            projects[i].id
                        )
                    ).length;
                    if (projects[i].notes == 0) projects[i].notes = '';
                }

                io.to(socket.id).emit('yourProjects', projects);
            }

            /**
             * Add a new comment
             * @param {object} data - Information about the comment
             */

            async function addComment(data) {
                data.author = socket.user;
                data.postDate = new Date();
                data.userNote = checkIfNote(data.content) || [];
                data.userNote.forEach(async userTagged => {
                    await Storage.addUserNote(
                        userTagged,
                        socket.user,
                        data.projectID,
                        data.taskID
                    );
                    for (let i in allUsersOnline) {
                        if (allUsersOnline[i].user == userTagged) {
                            io.to(allUsersOnline[i].id).emit('goUpdate');
                        }
                    }
                });
                await Storage.addComment(data);
                io.to(socket.id).emit('showComment', data);
                updateProjects();
                io.to(socket.id).emit('goUpdate');
            }

            /**
             * Gets all the users projects based on the session cookie
             */

            async function myProjects() {
                let projects = await Storage.getAllProjects(socket.user);
                for (let i = 0; i < projects.length; i++) {
                    projects[i].notes = (
                        await Storage.getAllUserNotesWithProject(
                            socket.user,
                            projects[i].id
                        )
                    ).length;
                    if (projects[i].notes == 0) projects[i].notes = '';
                }
                io.to(socket.id).emit('yourProjects', projects);
            }

            /**
             * Invites a new user to a project
             * @param {object} data - Information about the invite
             */

            async function addUser(data) {
                for (let i in data.users) {
                    if (
                        (
                            await Storage.getUserProject({
                                username: data.toUser,
                                projectID: data.projectID
                            })
                        ).length == 0
                    ) {
                        await Storage.sendInvite({
                            fromUser: socket.user,
                            toUser: data.users[i],
                            projectID: data.projectID
                        });

                        allInvites(data.users[i]);
                        emitToUser('goUpdate', 'user', data.users[i], data);
                    }
                }
                io.to(socket.id).emit('allGood');
            }
            async function getNewId() {
                let a =
                    'abcdefghijklmnopkqrtuvwxyzABCDEFGHIJKLMNOPKQRTUVWXYZ0123456789_-';
                let testId = '';
                for (let i = 0; i < 32; i++) {
                    testId += a[Math.floor(Math.random() * a.length)];
                }
                return testId;
            }
            /**
             * Sends a friend request
             * @param {string} username - Who should recive this friend request
             */

            async function addFriend(username) {
                await Storage.sendFriendRequest({
                    fromUser: socket.user,
                    toUser: username
                });
                io.to(socket.id).emit('allGood');
                emitToUser('goUpdate', 'user', username);
                allInvites(username);
            }

            /**
             * Accepts a project invite
             * @param {object} data  - The invite to accept
             */

            async function acceptProjectInvite(data) {
                let invite = (await Storage.getProjectInvite(data))[0];
                await Storage.addUserProject({
                    username: socket.user,
                    projectID: invite.projectID
                });
                await Storage.deleteProjectInvite(invite.id);
                await updateProjects();
                let LOG = log('join', {
                    user: socket.user,
                    from: invite.fromUser
                });
                io.to(invite.projectID).emit('log', LOG);
                await Storage.addLog(LOG, invite.projectID);
                io.to(socket.id).emit('goUpdate');
            }

            /**
             * Declines a project invite
             * @param {object} data  - The invite to decline
             */

            async function declineProjectInvite(data) {
                let invite = (await Storage.getProjectInvite(data))[0];
                await Storage.deleteProjectInvite(invite.id);
                io.to(socket.id).emit('goUpdate');
            }

            /**
             * Accepts a friend invite
             * @param {object} data  - The invite to accept
             */

            async function acceptFriendRequest(data) {
                let invite = (await Storage.getFriendRequest(data))[0];
                let id = await getNewId();
                await Storage.addFriend({
                    username: invite.fromUser,
                    friendUsername: invite.toUser,
                    id: id
                });
                await Storage.addFriend({
                    username: invite.toUser,
                    friendUsername: invite.fromUser,
                    id: id
                });
                await Storage.deleteFriendRequest(invite.id);
                io.to(socket.id).emit('goUpdate');
                io.to(socket.id).emit('addFriendToList', {
                    friend: invite.fromUser
                });
                emitToUser('addFriendToList', 'user', invite.fromUser, {
                    friend: invite.toUser
                });
            }
            /**
             * Declines a friend invite
             * @param {object} data  - The invite to decline
             */
            async function declineFriendRequest(data) {
                let invite = (await Storage.getFriendRequest(data))[0];
                await Storage.deleteFriendRequest(invite.id);
                io.to(socket.currentProject).emit('goUpdate');
            }
        }
        /**
         * Logs something to the project log
         * @param {string} action - What action shoulf be logged
         * @param {object} data - Information about the action
         */
        function log(action, data) {
            let time = newTime();
            wh({ data, action, id: socket.currentProject, user: socket.user });
            switch (action) {
                case 'move':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${socket.user}</b> moved ${data.name} to ${data.state}</div>`;
                case 'addedTask':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${socket.user}</b> created a task called "${data.name}"</div>`;
                case 'join':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${data.user}</b> has joined the project, invited by <b>@${data.from}</b></div>`;
                case 'remove':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${data.user}</b> removed the task "${data.name}"</div>`;
                case 'edit':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${data.user}</b> edited the task <b>@${data.name}</b></div>`;
                case 'assign':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${data.from}</b> assigned a task to <b>@${data.username}</b></div>`;
                case 'newEvent':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${data.from}</b> added a new event to the calendar</div>`;
                case 'removeAssign':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${data.from}</b> removed an assignment on task "${data.taskName}"</div>`;
                case 'removeEvent':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${data.from}</b> removed an event on the calendar"</div>`;
                case 'newWebhook':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${data.from}</b> added a webhook"</div>`;
                case 'removeWebhook':
                    return `<div><span style="background-color:lightgrey; border-radius:2px;">[${time.hours}.${time.minutes}.${time.seconds}]</span> <b>@${data.from}</b> removed an webhook"</div>`;
            }
        }

        /**
         * Checks if someone @ ed me [pls dont @ me]
         * @param {string} string - The comment to check if anyone was tagged
         */
        function checkIfNote(string) {
            let users = [];
            if (!string.includes('@')) return '';
            while (string.includes('@')) {
                users.push(string.split('@')[1].split(' ')[0]);
                string = string.substring(string.indexOf('@') + 1);
            }
            return users;
        }

        /**
         * Updates the projects tab for users when they get a notification
         */

        async function updateProjects() {
            let projects = await Storage.getAllProjects(socket.user);
            for (let i = 0; i < projects.length; i++) {
                projects[i].notes = (
                    await Storage.getAllUserNotesWithProject(
                        socket.user,
                        projects[i].id
                    )
                ).length;
                if (projects[i].notes == 0) projects[i].notes = '';
            }
            io.to(socket.id).emit('yourProjects', projects);
        }
        async function removeMessageNotes(friendUsername) {
            let id = await Storage.getFriendId({
                username: socket.user,
                friendUsername
            });
            await Storage.deleteMessageNote(id);
            let notes = {
                projectAndTaskNotes: await Storage.getAllUserNotes(
                    friendUsername
                ),
                allInvites: await Storage.getAllProjectInvites(friendUsername),
                allFriendRequests: await Storage.getAllFriendRequests(
                    friendUsername
                ),
                allMessageNotes: (
                    await Storage.getAllMessageNote(friendUsername)
                ).length
            };
            io.to(socket.id).emit('yourNotes', notes);
        }
        async function newChat(friendUsername) {
            let id = await Storage.getFriendId({
                username: socket.user,
                friendUsername
            });

            await Storage.deleteMessageNote(id);
            let chat = await Storage.getChat(id);
            io.to(socket.id).emit('showChat', chat);
            updateNotesList();
        }
        async function sendMessage(data) {
            if (socket.user.toLowerCase().includes('akkadian')) return;
            data.fromUser = socket.user;
            data.date = new Date();
            data.id = await Storage.getFriendId({
                username: data.fromUser,
                friendUsername: data.toUser
            });
            await Storage.addMessegeNote(data);
            await Storage.sendMessage(data);
            emitToUser('liveChat', 'user', data.toUser, data);
            let notes = {
                projectAndTaskNotes: await Storage.getAllUserNotes(data.toUser),
                allInvites: await Storage.getAllProjectInvites(data.toUser),
                allFriendRequests: await Storage.getAllFriendRequests(
                    data.toUser
                ),
                allMessageNotes: (await Storage.getAllMessageNote(data.toUser))
                    .length
            };
            emitToUser('yourNotes', 'user', data.toUser, notes);
        }
        async function removeTask({ taskID, projectID }) {
            let task = await Storage.getTask(taskID);
            let LOG = log('remove', { user: socket.user, name: task[0].name });
            io.to(projectID).emit('log', LOG);
            await Storage.addLog(LOG, projectID);
            await Storage.removeTask(taskID);
            io.to(projectID).emit('goUpdate');
        }

        async function updateNotesList() {
            let username = socket.user;
            let projectAndTaskNotes = await Storage.getAllUserNotes(username);
            let allInvites = await Storage.getAllProjectInvites(username);
            let allFriendRequests = await Storage.getAllFriendRequests(
                username
            );
            let allMessageNotes = (await Storage.getAllMessageNote(username))
                .length;
            io.to(socket.id).emit('yourNotes', {
                projectAndTaskNotes,
                allInvites,
                allFriendRequests,
                allMessageNotes
            });
        }

        async function getFriendNotes(data) {
            let out = [];
            let username = socket.user;
            for (let i in data) {
                let friendUsername = data[i];
                let obj = {};
                obj.notes = (
                    await Storage.getAllMessageNoteFromFriend({
                        fromUser: friendUsername,
                        toUser: username
                    })
                ).length;
                obj.friend = friendUsername;
                out.push(obj);
            }
            io.to(socket.id).emit('yourBadges', out);
        }

        async function removeFriend(friend) {
            await Storage.removeFriend({
                username: socket.user,
                friendUsername: friend
            });
            io.to(socket.id).emit('allGood');
            emitToUser('removeFriend', 'user', friend, socket.user);
        }
        async function removeProject(data) {
            let project = (await Storage.getProject(data.projectID))[0];
            let projectName = project.name;
            let projectCreator = project.creator;
            if (
                projectName == data.inputProjectName &&
                socket.user == projectCreator
            ) {
                let a = Storage.removeAllLogs(data.projectID);
                let b = Storage.removeAllTasks(data.projectID);
                let c = Storage.removeAllComments(data.projectID);
                let d = Storage.deleteUserNotesWithProjectID(data.projectID);
                let e = Storage.deleteProjectInviteByProjectID(data.projectID);
                let f = Storage.deleteUserProject(data.projectID);
                let g = Storage.deleteProject(data.projectID);
                await a;
                await b;
                await c;
                await d;
                await e;
                await f;
                await g;
                io.to(data.projectID).emit('href', '/');
            }
        }
        async function asignUserInfo(projectID) {
            let users = await Storage.getAllUserWithProjectID(projectID);
            for (let i = 0; i < users.length; i++) {
                let projectAsign = await Storage.getProjectAsign({
                    projectID,
                    username: users[i].username
                });
                if (projectAsign.length > 0)
                    users[
                        i
                    ].color = `rgba(${projectAsign[0].R},${projectAsign[0].G},${projectAsign[0].B},0.6)`;
            }
            io.to(socket.id).emit('asignUserInfo', users);
        }
        async function asignUser({ username, taskID, projectID }) {
            let projectAsign = (
                    await Storage.getProjectAsign({ username, projectID })
                ).length ?
                await Storage.getProjectAsign({ username, projectID }) :
                await Storage.makeProjectAsign({ username, projectID });
            await Storage.makeTaskAsign({ taskID, projectID, username });
            let LOG = log('assign', { from: socket.user, username });
            await Storage.addLog(LOG, projectID);
            io.to(projectID).emit('goUpdate');
        }

        async function newEvent({ title, start, end }) {
            if (!socket.currentProject) return;
            if (!title) return;
            if (!start) return;
            if (!end) return;
            await Storage.addNewEvent(
                title,
                start.toString(),
                end.toString(),
                socket.currentProject
            );
            let LOG = log('newEvent', { from: socket.user });
            await Storage.addLog(LOG, socket.currentProject);
            io.to(socket.currentProject).emit('goUpdate');
        }

        async function updateCalendar(pID) {
            let data = await Storage.getCalendarEvents(pID);
            io.to(socket.id).emit('calendarData', data);
        }

        async function removeThisEvent(id) {
            Storage.removeEvent(id);
            let LOG = log('removeEvent', { from: socket.user });
            await Storage.addLog(LOG, socket.currentProject);
            io.to(socket.currentProject).emit('goUpdate');
        }

        async function removeUserAssign(taskID) {
            let taskInfo = await Storage.getTask(taskID);
            await Storage.removeUserAssign(taskID);
            let LOG = log('removeAssign', {
                from: socket.user,
                taskName: taskInfo[0].name
            });
            await Storage.addLog(LOG, socket.currentProject);
            io.to(socket.currentProject).emit('goUpdate');
        }

        async function getWebhooks(id) {
            let wh = await Storage.getAllWebhooksForProject(id);
            io.to(socket.id).emit('webhooks', wh);
        }
        async function newWebhook({ url, projectID }) {
            let project = (await Storage.getProject(projectID))[0];
            if (socket.user !== project.creator) return;
            Storage.addWebhook(url, projectID);
            let LOG = log('newWebhook', { from: socket.user });
            await Storage.addLog(LOG, socket.currentProject);
        }

        async function removeWebhook(id) {
            let project = (await Storage.getProject(socket.currentProject))[0];
            if (socket.user !== project.creator) return;
            Storage.removeWebhook(id);
            let LOG = log('removewebhook', { from: socket.user });
            await Storage.addLog(LOG, socket.currentProject);
        }
    });

    function removeSocket(socket) {
        for (var i = 0; i < allUsersOnline.length; i++) {
            if (allUsersOnline[i].id === socket.id) {
                allUsersOnline.splice(i, 1);
            }
        }
        io.emit('onlinePeople', allUsersOnline.length);
    }
    async function allInvites(toUser) {
        let fInvites = await Storage.getAllFriendRequests(toUser);
        let pInvites = await Storage.getAllProjectInvites(toUser);
        let data = {
            projectInvites: pInvites,
            friendRequests: fInvites
        };
        emitToUser('updateInvites', 'user', toUser, data);
    }

    function emitToUser(event, prop, propValue, data) {
        if (data == undefined) {
            data = {};
        }
        for (let i in allUsersOnline) {
            if (allUsersOnline[i][prop] == propValue) {
                io.to(allUsersOnline[i].id).emit(event, data);
            }
        }
    }

    /**
     * Authemticates with socket io
     * @param {socket} socket - The socket to authenticate
     */
    function socketioAuth(socket) {
        var cookief = socket.handshake.headers.cookie;
        let cookies;
        let user;
        try {
            cookies = cookie.parse(socket.handshake.headers.cookie);
            user = Buffer.from(cookies['express:sess'], 'base64').toString();
        } catch (err) {
            socket.disconnect(true);
            removeSocket(socket);
            return;
        }

        if (user == '{}' || JSON.parse(user) == undefined) {
            socket.disconnect(true);
            removeSocket(socket);
        }
        return JSON.parse(user);
    }
}

function newTime() {
    let d = new Date();
    let hours = d.getHours().toString();
    let minutes = d.getMinutes().toString();
    let seconds = d.getSeconds().toString();
    if (hours.length == 1) {
        hours += '0';
        hours = hours
            .split('')
            .reverse()
            .join('');
    }
    if (minutes.length == 1) {
        minutes += '0';
        minutes = minutes
            .split('')
            .reverse()
            .join('');
    }
    if (seconds.length == 1) {
        seconds += '0';
        seconds = seconds
            .split('')
            .reverse()
            .join('');
    }
    return { hours, minutes, seconds };
}