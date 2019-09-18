
const connection = require("./mysql");
const bcryptjs = require("bcryptjs");

const addTask = "INSERT INTO task (name, description, state, postDate, id, projectID) VALUES (?, ?, ?, ?, ?, ?)"

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
    /**Adds a task*/
    async addTask(name, desc, procjetID) {
        let id = await getNewId();
        let postDate = new Date();
        await connection.queryP(addTask, [name, desc, 'BACKLOG', postDate, id, procjetID])
    }
    /**Checks if and id for a procjet already exists*/
    async verifyProcjetID(id) {
        return await connection.queryP(verifyProcjetID, id).length == undefined;
    }
    async getProject(id) {
        return await connection.queryP(getProject, id)[0];
    }
    async addProject(name, creator) {
        let id = await getNewId();
        await connection.queryP(addProject, [name, creator, `[${creator}]`, `[${creator}]`, id]);
    }
    async addUserToProjcet(username, projectID) {
        let project = await getProject(projectID)[0];
        let users = storeArray(project.users, username);
        await connection.queryP(addUserToProjcet, users);
    }
    /**Adds a user*/
    async addUser(username, password, name, lastname) {
        let testUsername = await this.getUser(username);
        if (testUsername == undefined || testUsername == "") {
            await connection.queryP(addUser, [username, await bcryptjs.hash(password, 10), name, lastname, "[]"]);
            return "Added user";
        }
        return "Username already exists!";
    }
    /**Gives user with the specified username*/
    async getUser(username) {
        return await connection.queryP(getUser, username);
    }
    async verifyUser(username, password) {
        let user = await this.getUser(username);
        //här returnerar jag true eller false beroende på om jag har hittat ett resultat och det resultat's lösenord stämmer över med det lösenord man skrivit in.
        return user && user.length > 0 && bcryptjs.compare(password, user[0].password);
    }
    /**Adds a procjetID to a user with a speceifed username*/
    async addProcjetToUser(projectID, username) {
        let user = await this.getUser(username)
        let projects = storeArray(user.projects, projectID)
        await connection.queryP(addProcjetToUser, projects);
    }
}
let Storage = new Database();
async function getNewId() {
    let a = "abcdefghijklmnopkqrtuvwxyzABCDEFGHIJKLMNOPKQRTUVWXYZ0123456789";
    let testId = "";
    for (let i = 0; i < 32; i++) {
        testId += a[Math.floor(Math.random() * a.length)];
    }

    if (await Storage.verifyProcjetID(testId)) {

        return testId;
    }
    return this.getNewId();
}
module.exports = Storage;