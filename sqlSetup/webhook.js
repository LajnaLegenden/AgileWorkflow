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
        process.exit(0);


    })
    connection.end();
    process.exit(0);
}

doStuff();