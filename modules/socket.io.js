const sIO = require('socket.io');

module.exports = (app) => {
    io = sIO.listen(app);
}

io.on('connection', (socket) => {
    //Check auth
    

});