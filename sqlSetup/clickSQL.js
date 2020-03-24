const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists comment");
    await connection.queryP(`
    CREATE TABLE click (
        id INT PRIMARY KEY AUTO_INCREMENT,
        x float,
        y float,
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