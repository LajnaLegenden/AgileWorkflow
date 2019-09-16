let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let pouchdb = require('pouchdb');


let db = new pouchdb('http://localhost:5984/todolist');


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


app.use(express.static(__dirname + '/public'));
http.listen(3000, function () {
  console.log('listening on *:3000');
});

var onlineCount = 0;


io.on('connection', function (socket) {
  io.emit('updateUsers', ++onlineCount);

  socket.on('disconnect', function () {
    io.emit('updateUsers', --onlineCount);
  });

  socket.on('needUserUpdate', function () {
    io.emit('updateUsers', onlineCount);
  });

  socket.on('newTask', function (data) {
    data._id = data.name;
    db.put(data).then(async function () {
      console.log("All good");
      io.emit('allGood');
      io.emit('tasks', await db.allDocs({ include_docs: true }))
    }).catch(function (err) {
      console.log(err);
    });
  });

  socket.on('getForEdit', async function (name) {
    db.get(name).then(function (doc) {
      io.to(socket.id).emit('editThis', doc);
    }).catch(function (err) {
      console.log(err);
    });
  });

  socket.on('delTask', async function (data) {
    db.get(data).then(function (doc) {
      db.remove(doc);
    }).catch(function (err) {
      console.log(err);
    });
    io.emit('tasks', await db.allDocs({ include_docs: true }));

  });

  socket.on('updateTask', function (data) {
    db.get(data.name).then(function (doc) {
      data._rev = doc._rev;
      data._id = data.name;
      return db.put(data);
    }).then(function (response) {
      io.emit('allGood');
    }).catch(function (err) {
      console.log(err);
    });
  });

  socket.on('getTasks', async function () {
    var tasks = await db.allDocs({ include_docs: true });
    io.emit('tasks', tasks);
  });



});
