const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists projectAsign");
    await connection.queryP(`
    CREATE TABLE projectAsign (
        R INT,
        G INT,
        B INT,
        projectID varchar(255),
        username varchar(255),
        id INT PRIMARY KEY AUTO_INCREMENT
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