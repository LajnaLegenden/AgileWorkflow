const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists userProject");
    await connection.queryP(`
    CREATE TABLE userProject (
        username varchar(255),
        projectID varchar(255),
        admin  varchar(255)
    );`, (error, results, fields) => {
        if (error) {
            console.log("error creating table topics ", error);
            process.exit(-1);
        }


    })
    connection.end();
    process.exit(0);
}

doStuff();