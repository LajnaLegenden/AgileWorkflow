const connection = require("../mysql");

async function doStuff() {
    await connection.queryP("drop table if exists Projects");
    await connection.queryP(`
    CREATE TABLE Projects (
        name varchar(255),
        creator varchar(255),
        admins varchar(255),
        users varchar(255),
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
