const mysql = require("mysql");
const util = require("util");

const connection = mysql.createConnection({
    host: "85.24.194.27",
    user: "ag_code",
    password: "ag_userPass60",
    database: "AG_TASKS"
});

connection.connect();
connection.queryP = util.promisify(connection.query);

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