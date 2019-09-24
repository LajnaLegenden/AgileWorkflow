const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists inviteProject");
    await connection.queryP(`
    CREATE TABLE inviteProject (
        fromUser varchar(255),
        toUser varchar(255),
        projectID varchar(255),
        projectName varchar(255),
        id varchar(255)
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
