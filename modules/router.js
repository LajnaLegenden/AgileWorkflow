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
    app.get('/', (req, res) => {
        // res.sendFile(file('index.html'), { root: "./" });
        res.render('index', { title: "Index", loggedIn: req.session.user });
    });

    app.get('/dashboard', auth, (req, res) => {
        res.render('dashboard', { title: "Projects", loggedIn: req.session.user });
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
}

function file(file) {
    return './views/' + file;
}