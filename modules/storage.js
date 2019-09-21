
const connection = require("./mysql");
const bcryptjs = require("bcryptjs");

const addTask = "INSERT INTO task (name, description, state, postDate, id, projectID) VALUES (?, ?, ?, ?, ?, ?)";
const getAllTasks = "SELECT * FROM task WHERE projectID = ?";
const updateState = "UPDATE task SET state = ? WHERE id = ?";
const getTask = "SELECT * FROM task WHERE id = ?"

const getProject = "SELECT * FROM project WHERE id = ?"
const verifyProcjetID = "SELECT * FROM project WHERE id = ?";
const addProject = "INSERT INTO project (name, creator, id) VALUES (?, ?, ?)"
const addUserToProjcet = "UPDATE project SET users = ?";
const getAllProjects = "SELECT * FROM userProject WHERE username = ?";
const addUserProject = "INSERT INTO userProject (username, projectID, admin) VALUES (?, ?, ?)";

const getUser = "SELECT * FROM user WHERE username = ?"
const addUser = "INSERT INTO user (username, password, firstname, lastname, email, projects) VALUES (?, ?, ?, ?, ?, ?)"
const addProcjetToUser = "UPDATE user SET projects = ?";

const addLog = "INSERT INTO log (html, projectID) VALUES (?, ?)";
const getAllLogs = "SELECT * FROM log WHERE projectID = ?";

const addComment = "INSERT INTO comment (author, content, postDate, taskID) VALUES (?, ?, ?, ?)";
const getAllComments = "SELECT * FROM comment WHERE taskID = ?";

const addUserNote = "INSERT INTO userNote (username, content, fromUser, projectID, taskID, id) VALUES (?, ?, ?, ?, ?, ?)";
const getAllUserNotes = "SELECT * FROM userNote WHERE username = ?";
const getUserNote = "SELECT * FROM userNote WHERE id = ?";

function storeArray(array, pushItem) {
    array = JSON.parse(array)
    array.push(pushItem);
    array = JSON.stringify(array);
    return array;
}
class Database {
    /**Adds a task*/
    async addTask({ projectID, name, description }) {
        let id = await getNewId();
        let postDate = new Date();
        await connection.queryP(addTask, [name, description, 'BACKLOG', postDate, id, projectID])
    }
    /**Returns all tasks*/
    async getAllTasks(projectID) {
        if(projectID != undefined){
            return await connection.queryP(getAllTasks, projectID);
        }
    }
    /**Returns single task*/
    async getTask(id) {
        return await connection.queryP(getTask, id);
    }
    /**Updates the tasks state with the specified id*/
    async updateState({ state, id }) {
        await connection.queryP(updateState, [state, id])
    }
    /**Checks if and id for a procjet already exists*/
    async verifyProcjetID(id) {
        return await connection.queryP(verifyProcjetID, id).length == undefined;
    }
    /**Returns projcet with the specified id*/
    async getProject(id) {
        return await connection.queryP(getProject, id);
    }
    async getAllProjects(username) {
        if (username != undefined) {
            let allProjectsIds = await connection.queryP(getAllProjects, username);
            let projects = [];
            for (let i = 0; i < allProjectsIds.length; i++) {
                projects.push((await this.getProject(allProjectsIds[i].projectID))[0])
            }
            return projects
        }
    }
    /**Adds a project*/
    async addProject({ name, creator }) {
        let id = await getNewId();
        await connection.queryP(addProject, [name, creator, id]);
        await connection.queryP(addUserProject, [creator, id, true]);
    }
    /**Adds a user to a project*/
    async addUserToProjcet({ username, projectID }) {
        let project = await getProject(projectID)[0];
        let users = storeArray(project.users, username);
        await connection.queryP(addUserToProjcet, users);
    }
    /**Adds a user*/
    async addUser({ username, password, firstname, lastname, email }) {
        let testUsername = await this.getUser(username);
        if (testUsername == undefined || testUsername == "") {
            await connection.queryP(addUser, [username, await bcryptjs.hash(password, 10), firstname, lastname, email, "[]"]);
            return "Added user";
        }
        return "Username already exists!";
    }
    /**Gives user with the specified username*/
    async getUser(username) {
        return await connection.queryP(getUser, username);
    }
    /**Verifys that the user exists*/
    async verifyUser({ username, password }) {
        let user = await this.getUser(username);
        return user && user.length > 0 && bcryptjs.compare(password, user[0].password);
    }
    /**Adds a procjetID to a user with a speceifed username*/
    async addProcjetToUser({ projectID, username }) {
        let user = await this.getUser(username)
        let projects = storeArray(user.projects, projectID)
        await connection.queryP(addProcjetToUser, projects);
    }
    async getAllLogs(projectID) {
        return await connection.queryP(getAllLogs, projectID);
    }
    async addLog(html, projectID){
        await connection.queryP(addLog, [html, projectID]);
    }
    async addComment({author, content, postDate, taskID}){
        await connection.queryP(addComment, [author, content, postDate, taskID]);
    }
    async getAllComments(taskID){
        return await connection.queryP(getAllComments, taskID);
    }
}
let Storage = new Database();
async function getNewId() {
    let a = "abcdefghijklmnopkqrtuvwxyzABCDEFGHIJKLMNOPKQRTUVWXYZ0123456789_-";
    let testId = "";
    for (let i = 0; i < 8; i++) {
        testId += a[Math.floor(Math.random() * a.length)];
    }

    if (await Storage.verifyProcjetID(testId)) {

        return testId;
    }
    return this.getNewId();
}
module.exports = Storage;