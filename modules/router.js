module.exports = (app) =>{
    app.get('/', (req,res) => {
        res.sendFile(file('index.html'),{root: "./"});
    });

    app.get('/dashboard', (req,res) => {
        res.sendFile(file('dashboard.html'),{root: "./"});
    });
}

function file(file){
   return './views/' + file;
}