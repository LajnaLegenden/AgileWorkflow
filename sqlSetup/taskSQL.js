const connection = require("../modules/mysql");

async function doStuff() {
    await connection.queryP("drop table if exists task");
    await connection.queryP(`
    CREATE TABLE task (
        name varchar(255),
        description varchar(255),
        state varchar(255),
        postDate varchar(255),
        projectID varchar(255),
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