let express = require('express');
let app = express();
let http = require('http').createServer(app);

const socketIO = require('./modules/socket.io');

socketIO(https);
//Load env variablres
require('dotenv').config();
 
//Config
const port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.render('index');
});


app.use(express.static(__dirname + '/public'));

//HBS
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.listen(port,() => {
  console.log(`Listening on port ${port}`);
});