
const connection = require("../mysql");

const getProject = "SELECT * FROM project WHERE id = ?"
const verifyProcjetID = "SELECT * FROM project WHERE id = ?";
const addProject = "INSERT INTO project (name, creator, admins, users, id) VALUES (?, ?, ?, ?, ?)"
const addUserToProjcet = "UPDATE project SET users = ?";

const getUser = "SELECT * FROM user WHERE username = ?"
const addUser = "INSERT INTO user (username, password, name, lastname, projects) VALUES (?, ?, ?, ?, ?)"
const addProcjetToUser = "UPDATE user SET projects = ?";
function storeArray(array, pushItem) {
    array = JSON.parse(array)
    array.push(pushItem);
    array = JSON.stringify(array);
    return array;
}
class Database {
    async addTask(){

    }
    /**Checks if and id for a procjet already exists*/
    async verifyProcjetID(id) {
        return await connection.queryP(verifyProcjetID, id).length == undefined;
    }
    async getProject(id){
        return await connection.queryP(getProject, id)[0];
    }
    async addProject(name, creator){
        let id = await getNewId();
        await connection.queryP(addProject,[name, creator, `[${creator}]`, `[${creator}]`, id]);
    }
    async addUserToProjcet(username, projectID){
        let project = await getProject(projectID)[0];
        let users = storeArray(project.users, username);
        await connection.queryP(addUserToProjcet, users);
    }
    async addUser(username, password, name, lastname) {
        let testUsername = await getUser(username);
        if (testUsername == undefined || testUsername == "") {
            await connection.queryP(addUser, [username, password, name, lastname, "[]"]);
            return "Added user";
        }
        return "Username already exists!";
    }
    /**Gives user with the specified username*/
    async getUser(username) {
        return await connection.queryP(getUser, username)[0];
    }
    /**Adds a procjetID to a user with a speceifed username*/
    async addProcjetToUser(projectID, username) {
        let user = await getUser(username)
        let projects = storeArray(user.projects, projectID)
        await connection.queryP(addProcjetToUser, projects);
    }
}
async function getNewId() {
    let a = "abcdefghijklmnopkqrtuvwxyzABCDEFGHIJKLMNOPKQRTUVWXYZ0123456789";
    let testId = "";
    for (let i = 0; i < 32; i++) {
        testId += a[Math.floor(Math.random() * a.length)];
    }

    if (await storage.verifyProcjetID(testId)) {

        return testId;
    }
    return this.getNewId();
}
let Storage = new Database();
module.exports = Storage;