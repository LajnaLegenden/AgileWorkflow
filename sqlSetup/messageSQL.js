const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists message");
    await connection.queryP(`
    CREATE TABLE message (
        message varchar(255),
        fromUser varchar(255),
        toUser varchar(255),
        date varchar(255),
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