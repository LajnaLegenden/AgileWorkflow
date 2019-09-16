
const connection = require("../mysql");
const get = "SELECT * FROM mysql.user";

class Database{
    test(){
        return await connection.queryP(get);
    }
}

let Storage = new Database();
Storage.test();