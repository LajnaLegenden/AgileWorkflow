let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


app.use(express.static(__dirname + '/public'));
http.listen(3000, function () {
  console.log('listening on *:3000');
});
