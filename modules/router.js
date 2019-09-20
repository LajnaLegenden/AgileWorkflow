const Storage = require("./storage.js");
function auth(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login?returnUrl=" + req.url);
    } else {
        next();
    }
}


module.exports = (app) => {

    app.get("/favicon.ico", (req, res) => {
        res.sendStatus(404);
    })
    app.get('/', async (req, res) => {
        // res.sendFile(file('index.html'), { root: "./" });
        let allProjects = await Storage.getAllProjects();
        res.render('index', { title: "Index", loggedIn: req.session.user, allProjects});
    });

    app.get('/dashboard/:projectID', auth, async (req, res) => {
        let projectID = req.params.projectID;
        let project = (await Storage.getProject(projectID))[0];
        let allProjects = await Storage.getAllProjects();
        res.render('dashboard', { title: "Projects", loggedIn: req.session.user, project, allProjects});
    });

    app.get('/signup', (req, res) => {
        res.sendFile(file('signup.html'), { root: "./" });
    });
    app.get('/login', (req, res) => {
        res.sendFile(file('login.html'), { root: "./", });
    });
    app.get("/logout", (req, res) => {
        req.session.user = undefined;
        res.redirect("/");
    });

    app.post("/signup", async (req, res) => {
        let user = req.body.user;
        console.log(user)
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
        console.log("asdasdsa", user);
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
        let allProjects = await Storage.getAllProjects();
        console.log(user)
        res.render("user", { title: username, loggedIn: username, user, allProjects})
    });
}

function file(file) {
    return './views/' + file;
}