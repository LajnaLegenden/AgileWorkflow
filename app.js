let express = require('express');
let app = express();
let http = require('http').createServer(app);
let exphbs = require('express-handlebars');
const cookieSession = require("cookie-session");
const socketIO = require('./modules/socket.io');
const router = require('./modules/router.js');

app.use(cookieSession({
  secret: "sdfkaödfjasdöiolasdiojhöoiököjöfasdkojhöasdioöjhasdoijh"
}));
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