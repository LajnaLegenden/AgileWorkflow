module.exports = (app) =>{
    app.get('/', (req,res) => {
        res.sendFile(file('index.html'),{root: "./"});
    });

    app.get('/dashboard', (req,res) => {
        res.sendFile(file('dashboard.html'),{root: "./"});
    });

    app.get('/signup', (req,res) => {
        res.sendFile(file('signup.html'), {root:"./"});
    });

    app.get('/login', (req,res) => {
        res.sendFile(file('login.html'), {root:"./"});
    });
}

function file(file){
   return './views/' + file;
}