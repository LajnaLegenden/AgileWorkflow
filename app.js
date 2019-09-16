let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);


//Load env variablres
require('dotenv').config();
 
//Config
const port = process.env.PORT || 443;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


app.use(express.static(__dirname + '/public'));
http.listen(port, function () {
  console.log('listening on *:3000');
});
