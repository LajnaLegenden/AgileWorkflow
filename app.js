const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const socketIO = require('./modules/socket.io');
const router = require('./modules/router.js');
const hbs = require('express-hbs');

app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(cookieSession({
  secret: "sdfkaödfjasdöiolasdiojhöoiököjöfasdkojhöasdioöjhasdoijh"
}));
app.use(bodyParser.urlencoded({ extended: true }))

socketIO(http);
router(app);
//Load env variablres
require('dotenv').config();

//Config
const port = process.env.PORT || 3000;


app.use('/public', express.static('public'));


http.listen(port, () => {
  console.log("Server opend on port " + port);
});