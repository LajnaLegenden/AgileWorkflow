const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists userFriend");
    await connection.queryP(`
    CREATE TABLE userFriend (
        username varchar(255),
        friendUsername,
        date
    );`, (error, results, fields) => {
        if(error) {
            console.log("error creating table topics ", error);
            process.exit(-1);
        }
        
            connection.query("SHOW TABLES", (error, result, fields) => {
                console.log("created tables!", error, result, fields);
                
            })
    })
    connection.end();
}

doStuff();
