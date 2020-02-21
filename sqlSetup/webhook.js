const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists webhook");
    await connection.queryP(`
    CREATE TABLE webhook (
        id INT PRIMARY KEY AUTO_INCREMENT,
        projectID varchar(32),
        url varchar(128)
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
}

doStuff();
