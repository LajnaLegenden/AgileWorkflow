//Load env variablres
require('dotenv').config({ path: './env' });

const io = require('@pm2/io')

io.init({
  transactions: true, // will enable the transaction tracing
  http: true // will enable metrics about the http server (optional)
})

const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const socketIO = require('./modules/socket.io');
const router = require('./modules/router.js');
const hbs = require('express-hbs');
const fs = require('fs');
//Handlebars setup
app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');


let server = http.createServer(app);

//Cookie secret
app.use(cookieSession({
  secret: process.env.SECRET
}));
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/public', express.static('public'));

//Start stuff
socketIO(cookieSession({
  secret: process.env.SECRET
}), server);
router(app);

//Config things
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(port);
});