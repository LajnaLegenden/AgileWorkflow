const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists comment");
    await connection.queryP(`
    CREATE TABLE comment (
        author varchar(255),
        content varchar(255),
        postDate varchar(255),
        taskID varchar(255)
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
