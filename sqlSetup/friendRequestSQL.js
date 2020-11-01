const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists friendRequest");
    await connection.queryP(`
    CREATE TABLE friendRequest (
        fromUser varchar(255),
        toUser varchar(255),
        id varchar(255)
    );`, (error, results, fields) => {
        if (error) {
            console.log("error creating table topics ", error);
            process.exit(-1);
        }
        process.exit(0);


    })
    connection.end();
    process.exit(0);
}

doStuff();