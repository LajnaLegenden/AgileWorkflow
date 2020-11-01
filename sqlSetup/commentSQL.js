const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists comment");
    await connection.queryP(`
    CREATE TABLE comment (
        author varchar(255),
        content varchar(255),
        postDate varchar(255),
        taskID varchar(255),
        projectID varchar(255)
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