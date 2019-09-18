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
        res.sendFile(file('login.html'), { root: "./", });
    });

    app.post("/signup", async (req, res) =>{
        let user = req.body.user;
        let result = await Storage.addUser(user.uName, user.pass1, user.fName, user.lName);
        if (result == "Added user") {
            res.redirect("/");
        } else {
            res.send(result);
        }
    });
    app.post("/login", async (req, res) => {
        let user = req.body.user;
        if (await Storage.verifyUser(user.uName, user.pass1)) {
            req.session.user = user.uName;
            res.redirect("/");
        } else {
            res.send("Wrong username or password!");
        };
    });
}

function file(file) {
    return './views/' + file;
}