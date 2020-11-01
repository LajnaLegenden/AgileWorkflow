const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists friend");
    await connection.queryP(`
    CREATE TABLE friend (
        username varchar(255),
        friendUsername varchar(255),
        id varchar(255)
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