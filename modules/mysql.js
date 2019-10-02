const mysql = require("mysql");
const util = require("util");
require('dotenv').config({ path: './env' });
console.log(process.env.DBADDR)
let connection;
function connectDB() {
    connection = mysql.createConnection({
        host: process.env.DBADDR,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
        database: process.env.DBNAME
    });
    connection.queryP = util.promisify(connection.query);
}
connectDB();
// connection.on("error", connectDB);


// try {
//     connection.connect();
//     connection.queryP = util.promisify(connection.query);
// } catch (error) {
//     console.log(error);
//     connection.connect();
// }

module.exports = connection;

if (__filename == process.argv[1]) {
    doStuff();
}

async function doStuff() {
    try {
        let result = await connection.queryP(process.argv[2]);
        console.log(result);
    } catch (e) {
        console.error(e);
    }
    connection.end();
}