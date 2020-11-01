const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists events");
    await connection.queryP(`
    CREATE TABLE events (
        title varchar(255),
        start varchar(255),
        end varchar(255),
        id varchar(255),
        projectID varchar(255)
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