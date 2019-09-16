const connection = require("./mysql");

async function doStuff() {
    await connection.queryP("drop table if exists item");
    await connection.queryP(`
    CREATE TABEL item (
        name varchar(255),
        description varchar(255),
        category varchar(255),
        stock int,
        price decimal(9,2),
        img varchar(255),
        id INT AUTO_INCREMENT PRIMARY KEY
    );`, (error, results, fields) => {
        if(error) {
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
