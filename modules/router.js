const Storage = require("./storage.js");
function auth(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login?returnUrl="+req.url);
    } else {
        next();
    }
}
module.exports = (app) => {
    
    app.get("/favicon.ico", (req, res) => {
        res.sendStatus(404);
    })
    app.get('/', (req, res) => {
        res.sendFile(file('index.html'), { root: "./" });
    });

    app.get('/dashboard',auth, (req, res) => {
        res.sendFile(file('dashboard.html'), { root: "./" });
    });

    app.get('/signup', (req, res) => {
        res.sendFile(file('signup.html'), { root: "./" });
    });
    app.get('/login', (req, res) => {
        res.sendFile(file('login.html'), { root: "./", });
    });

    app.post("/signup", async (req, res) => {
        console.log(req.body);
        let user = req.body.user;
        let result = await Storage.addUser(user.uName, user.pass1, user.fName, user.lName);
        if (result == "Added user") {
            req.session.user = user.uName;
            res.redirect("/");
        } else {
            res.send(result);
        }  
    });
    app.post("/login", async (req, res) => {
        let user = req.body.user;
        if (await Storage.verifyUser(user.uName, user.uName)) {
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