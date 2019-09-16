const storage = require("./storage");
class Project {
    constructor(name, creator) {
        this.name = name
        this.creator = creator;
        this.tasks = [];
        this.users = [creator];
        this.admins = [creator];
        this.id = this.getNewId();
    }

}
async function main() {
    let a = new Project("Webbserver", "mattias");
    console.log(await a.id)
}

main();

