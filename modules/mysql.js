const mysql = require("mysql2");
const util = require("util");
require('dotenv').config({ path: './../env' });
console.log(process.env.DBADDR)
let connection;

function connectDB() {
    connection = mysql.createPool({
        connectionLimit: 100,
        host: process.env.DBADDR,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
        database: process.env.DBNAME
    });
    connection.queryP = util.promisify(connection.query);
}
connectDB();
connection.on("error", connectDB);

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