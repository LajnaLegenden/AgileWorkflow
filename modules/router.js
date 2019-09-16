module.exports = (app) =>{
    app.get('/', (req,res) => {
        res.sendFile(file('index.html'),{root: "./"});
    });
}

function file(file){
   return './views/' + file;
}