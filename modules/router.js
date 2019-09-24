const Storage = require("./storage.js");
const express = require('express');
function auth(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login?returnUrl=" + req.url);
    } else {
        next();
    }
}


module.exports = (app) => {

    app.use(function (req, res, next) {
        if (req.secure) {
            // request was via https, so do no special handling
            next();
        } else {
            // request was via http, so redirect to https
            res.redirect('https://' + req.headers.host + req.url);
        }
    });

    app.get("/favicon.ico", (req, res) => {
        res.sendStatus(404);
    })
    app.get('/', async (req, res) => {
        // res.sendFile(file('index.html'), { root: "./" });
        let username = req.session.user;
        let allProjects = "";
        let userNotes = "";
        let allInvites = ""
        let allFriendRequests = ""
        let totalNotes = "";
        if (username) {
            allInvites = await Storage.getAllProjectInvites(username);
            allFriendRequests = await Storage.getAllFriendRequests(username);
            allProjects = await Storage.getAllProjects(username);
            userNotes = (await Storage.getAllFriendRequests(username)).length + (await Storage.getAllProjectInvites(username)).length;
            let projectAndTaskNotes = await Storage.getAllUserNotes(username);
            totalNotes = userNotes + projectAndTaskNotes.length;
            if (userNotes == 0) userNotes = "";
        }
        res.render('index', { title: "Index", loggedIn: username, allProjects, userNotes, allInvites, allFriendRequests, totalNotes });
    });

    app.get('/dashboard/:projectID', auth, async (req, res) => {
        let projectID = req.params.projectID;
        let project = (await Storage.getProject(projectID))[0];
        let user = req.session.user;
        let allProjects = await Storage.getAllProjects(user);
        for (let i = 0; i < allProjects.length; i++) {
            allProjects[i].notes = (await Storage.getAllUserNotesWithProject(user, allProjects[i].id)).length;
            if (allProjects[i].notes == 0) allProjects[i].notes = "";
        }
        let logs = await Storage.getAllLogs(projectID)
        let userNotes = (await Storage.getAllFriendRequests(user)).length + (await Storage.getAllProjectInvites(user)).length;
        let projectAndTaskNotes = await Storage.getAllUserNotes(user);
        let totalNotes = userNotes + projectAndTaskNotes.length;
        let allInvites = await Storage.getAllProjectInvites(user);
        let allFriendRequests = await Storage.getAllFriendRequests(user);
        if (userNotes == 0) userNotes = "";
        res.render('dashboard', { title: "Projects", loggedIn: user, project, allProjects, logs, userNotes, projectAndTaskNotes, totalNotes, allInvites, allFriendRequests });
    });

    app.get('/signup', (req, res) => {
        res.sendFile(file('signup.html'), { root: "./" });
    });
    app.get('/login', (req, res) => {
        if (req.session.user !== undefined) {
            res.redirect('/');
        }
        res.sendFile(file('login.html'), { root: "./", });
    });
    app.get("/logout", (req, res) => {
        req.session.user = undefined;
        res.redirect("/");
    });

    app.post("/signup", async (req, res) => {
        let user = req.body.user;
        let result = await Storage.addUser(user);
        if (result == "Added user") {
            req.session.user = user.username;
            res.redirect("/");
        } else {
            res.send(result);
        }
    });
    app.post("/login", async (req, res) => {

        let user = req.body.user;
        if (await Storage.verifyUser(user)) {
            req.session.user = user.username;
            res.redirect("/");
        } else {
            res.send("Wrong username or password!");
        };
    });
    app.get("/user", auth, async (req, res) => {
        let username = req.session.user;
        let user = (await Storage.getUser(username))[0];
        let allProjects = await Storage.getAllProjects(username);
        let allInvites = await Storage.getAllProjectInvites(username);
        let allFriendRequests = await Storage.getAllFriendRequests(username);
        let friends = await Storage.getAllFriends(username);
        let userNotes = (await Storage.getAllFriendRequests(username)).length + (await Storage.getAllProjectInvites(username)).length;
        let projectAndTaskNotes = await Storage.getAllUserNotes(username);
        let totalNotes = userNotes + projectAndTaskNotes.length;
        if (userNotes == 0) userNotes = "";
        res.render("user", { title: username, loggedIn: username, user, allProjects, allInvites, allFriendRequests, friends, userNotes, projectAndTaskNotes, totalNotes })
    });
}

function file(file) {
    return './views/' + file;
}