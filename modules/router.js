const Storage = require("./storage.js");
module.exports = (app) => {
    app.get('/', (req, res) => {
        res.sendFile(file('index.html'), { root: "./" });
    });

    app.get('/dashboard', (req, res) => {
        res.sendFile(file('dashboard.html'), { root: "./" });
    });

    app.get('/signup', (req, res) => {
        res.sendFile(file('signup.html'), { root: "./" });
    });

    app.get('/login', (req, res) => {
        res.sendFile(file('login.html'), { root: "./",});
    });

    app.post("/signup", async (req, res) => {
        let user = req.body.user;
        await Storage.addUser(user.username, user.password, user.name, user.lastname);
        req.session.user = user.username;
        res.redirect("/");
    });
    app.post("/login", async (req, res) => {
        let user = req.body.user;
        if(await Storage.verifyUser(user.username, user.password)){
            req.session.user = user.username;
            res.redirect("/");
        } else{
            res.send("Wrong username or password!");
        };
    });
}

function file(file) {
    return './views/' + file;
}