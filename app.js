const express = require('express');
const app = express();
const https = require('https');
const path = require('path');
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const socketIO = require('./modules/socket.io');
const router = require('./modules/router.js');
const hbs = require('express-hbs');
const fs = require('fs');

//Load env variablres
require('dotenv').config();

console.log(process.env.PORT);

var options = {
  key: fs.readFileSync('./cert/localhost.key'),
  cert: fs.readFileSync('./cert/localhost.cert'),
  requestCert: false,
  rejectUnauthorized: false
};

let server = https.createServer(options, app);



//Handlebars setup
app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

//Cookie secret
app.use(cookieSession({
  secret: process.env.SECRET || "sdfkaödfjasdöiolasdiojhöoiököjöfasdkojhöasdioöjhasdoijh"
}));
app.use(bodyParser.urlencoded({ extended: true }))

//Start stuff
socketIO(server);
router(app);


//Config things
const port = process.env.PORT || 3000;


app.use('/public', express.static('public'));



server.listen(port, () => {
  console.log('Server Listening on port ' + port);
});
