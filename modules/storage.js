
const connection = require("../mysql");
const verifyID = "SELECT * FROM projects WHERE id = ?";

class Database{
    async verifyID(id){
        return await connection.queryP(verifyID, id).length == 0;
    }
}
let Storage = new Database();
module.exports = Storage;