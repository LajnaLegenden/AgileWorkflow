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
            console.log("asd");
            res.redirect('https://' + req.headers.host + req.url);
        }
    });

    app.get("/favicon.ico", (req, res) => {
        res.sendStatus(404);
    })
    app.get('/', async (req, res) => {
        // res.sendFile(file('index.html'), { root: "./" });
        let username = req.session.user;
        let allProjects = await Storage.getAllProjects(username);
        res.render('index', { title: "Index", loggedIn: username, allProjects });
    });

    app.get('/dashboard/:projectID', auth, async (req, res) => {
        let projectID = req.params.projectID;
        let project = (await Storage.getProject(projectID))[0];
        let user = req.session.user;
        let allProjects = await Storage.getAllProjects(user);
        for (let i = 0; i < allProjects.length; i++) {
            allProjects[i].notes = (await Storage.getAllUserNotes(user, allProjects[i].id)).length;
            if (allProjects[i].notes == 0) allProjects[i].notes = "";
        }
        let logs = await Storage.getAllLogs(projectID)
        res.render('dashboard', { title: "Projects", loggedIn: user, project, allProjects, logs});
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
        console.log(user)
        res.render("user", { title: username, loggedIn: username, user, allProjects })
    });
}

function file(file) {
    return './views/' + file;
}