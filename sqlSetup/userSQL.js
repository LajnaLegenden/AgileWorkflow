const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists user");
    await connection.queryP(`
    CREATE TABLE user (
        username varchar(255),
        password varchar(255),
        email varchar(255),
        firstname varchar(255),
        lastname varchar(255),
        projects varchar(255)
    );`, (error, results, fields) => {
        if (error) {
            console.log("error creating table topics ", error);
            process.exit(-1);
        }

        connection.query("SHOW TABLES", (error, result, fields) => {
            console.log("created tables!", error, result, fields);

        })
    })
    connection.end();
    process.exit(0);
}

doStuff();