const Storage = require("./storage.js");
const express = require('express');
function auth(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login?returnUrl=" + req.url);
    } else {
        next();
    }
}
function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]));
}

module.exports = (app) => {

    app.get("/favicon.ico", (req, res) => {
        res.sendStatus(404);
    })

    app.get('/login', (req, res) => {
        res.render('login', { title: "Login" });
    });
    app.get('/', async (req, res, next) => {
        try {
            let username;
            if (req.session.user != undefined)
                username = sanitize(req.session.user);
            let allProjects = "";
            let userNotes = "";
            let allInvites = ""
            let allFriendRequests = ""
            let totalNotes = 0;
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
        } catch (err) {
            next(err)
        }

    });
    app.get('/dashboard/:projectID', auth, async (req, res, next) => {
        try {
            let projectID = req.params.projectID;
            let user = sanitize(req.session.user);
            let hasAcess = (await Storage.getUserProject({ username: user, projectID })).length != 0;
            if (!hasAcess) {
                res.redirect('/');
            } else {
                let project = (await Storage.getProject(projectID))[0];
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
            }
        } catch (err) {
            next(err)
        }

    });
    app.get('/signup', (req, res) => {
        res.render('signup', { title: "Sign up" })
    });
    app.get('/login', (req, res) => {
        if (req.session.user !== undefined) {
            res.redirect('/');
        }
        res.render('index', { title: "Log in" })
    });
    app.get("/logout", (req, res) => {
        req.session.user = undefined;
        res.redirect("/");
    });

    app.post("/signup", async (req, res, next) => {
        try {
            if (req.session.user !== undefined) {
                res.redirect('/');
            }
            let user = req.body.user
            user["firstname"] = sanitize(user["firstname"]);
            user["lastname"] = sanitize(user["lastname"]);
            user["email"] = sanitize(user["email"]);
            user["username"] = sanitize(user["username"]);
            user["password"] = sanitize(user["password"]);
            user["password2"] = sanitize(user["password2"]);
            let result = await Storage.addUser(user);
            if (result == "Added user") {
                req.session.user = user.username;
                res.redirect("/");
            } else {

                res.send(result);
            }
        } catch (err) {
            next(err)
        }
    });
    app.post("/login", async (req, res, next) => {
        try {
            let user = req.body.user;
            if (await Storage.verifyUser(user)) {

                req.session.user = user.username;

                res.redirect("/");
            } else {
                res.send("Wrong username or password!");
            };
        } catch (err) {
            next(err)
        }

    });
    app.get("/user", auth, async (req, res, next) => {
        try {
            let username = sanitize(req.session.user);
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
        } catch (err) {
            next(err);
        }
    });
    app.all("*", (req, res) => {
        res.render("error", { title: "Error" });
    });
}

function file(file) {
    return './views/' + file;
}