const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists log");
    await connection.queryP(`
    CREATE TABLE log (
        html varchar(255),
        projectID varchar(255),
        id INT PRIMARY KEY AUTO_INCREMENT
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