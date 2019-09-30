
const connection = require("./mysql");
const bcryptjs = require("bcryptjs");

const addTask = "INSERT INTO task (name, description, state, postDate, id, projectID) VALUES (?, ?, ?, ?, ?, ?)";
const getAllTasks = "SELECT * FROM task WHERE projectID = ?";
const updateState = "UPDATE task SET state = ? WHERE id = ?";
const getTask = "SELECT * FROM task WHERE id = ?";
const removeTask = "DELETE FROM task WHERE id = ?";
const editTask = "UPDATE task SET name = ?, description = ? WHERE id = ?";
const removeAllTasks = "DELETE FROM task WHERE projectID = ?";

const getProject = "SELECT * FROM project WHERE id = ?"
const verifyProcjetID = "SELECT * FROM project WHERE id = ?";
const addProject = "INSERT INTO project (name, creator, id) VALUES (?, ?, ?)"
const addUserToProjcet = "UPDATE project SET users = ?";
const getAllProjects = "SELECT * FROM userProject WHERE username = ?";
const deleteProject = "DELETE FROM project WHERE id = ?";

const addUserProject = "INSERT INTO userProject (username, projectID, admin) VALUES (?, ?, ?)";
const getUserProject = "SELECT * FROM userProject WHERE (username = ? AND projectID = ?)"

const getUser = "SELECT * FROM user WHERE username = ?"
const addUser = "INSERT INTO user (username, password, firstname, lastname, email, projects) VALUES (?, ?, ?, ?, ?, ?)"
const addProcjetToUser = "UPDATE user SET projects = ?";
const deleteUserProject = "DELETE FROM userProject WHERE projectID = ?";

const addLog = "INSERT INTO log (html, projectID) VALUES (?, ?)";
const getAllLogs = "SELECT * FROM log WHERE projectID = ?";
const getAllLogsLimit100 = "SELECT * FROM (SELECT * FROM log WHERE projectID = ? ORDER BY id DESC LIMIT 100) sub ORDER BY id ASC;";
const removeAllLogs = "DELETE FROM log WHERE projectID = ?";

const addComment = "INSERT INTO comment (author, content, postDate, taskID, projectID) VALUES (?, ?, ?, ?, ?)";
const getAllComments = "SELECT * FROM comment WHERE taskID = ?";
const removeAllComments = "DELETE FROM comment WHERE projectID = ?";

const addUserNote = "INSERT INTO userNote (username, fromUser, projectID, taskID, id) VALUES (?, ?, ?, ?, ?)";
const getAllUserNotes = "SELECT * FROM userNote WHERE username = ?";
const getAllUserNotesWithProject = "SELECT * FROM userNote WHERE (username = ? AND projectID = ?)";
const getAllUserNotesWithTask = "SELECT * FROM userNote WHERE (username = ? AND taskID = ?)";
const getUserNote = "SELECT * FROM userNote WHERE id = ?";
const deleteUserNotes = "DELETE FROM userNote WHERE taskID = ?";
const deleteUserNotesWithProjectID = "DELETE FROM userNote WHERE projectID = ?";

const sendInvite = "INSERT INTO inviteProject (fromUser, toUser, projectID,projectName, id) VALUES (?, ?, ?, ?, ?)";
const getAllProjectInvites = "SELECT * FROM inviteProject WHERE toUser = ?";
const getProjectInvite = "SELECT * FROM inviteProject WHERE id = ?";
const getProjectInviteByProjectID = "SELECT * FROM inviteProject WHERE projectID = ?";
const deleteProjectInvite = "DELETE FROM inviteProject WHERE id = ?";
const deleteProjectInviteByProjectID = "DELETE FROM inviteProject WHERE projectID = ?";

const sendFriendRequest = "INSERT INTO friendRequest (fromUser, toUser, id) VALUES (?, ?, ?)";
const getAllFriendRequests = "SELECT * FROM friendRequest WHERE toUser = ?";
const getFriendRequest = "SELECT * FROM friendRequest WHERE id = ?";
const deleteFriendRequest = "DELETE FROM friendRequest WHERE id =  ?";
const getFriendRequestByFromUser = "SELECT * FROM friendRequest WHERE fromUser = ?";

const addFriend = "INSERT INTO friend (username, friendUsername, id) VALUES (?, ?, ?)";
const getAllFriends = "SELECT * FROM friend WHERE username = ?";
const getFriendId = "SELECT * FROM friend WHERE (username = ? AND friendUsername = ?)";
const removeFriend = "DELETE FROM friend WHERE (username = ? AND friendUsername = ?)";

const getChat = "SELECT * FROM message WHERE id = ?";
const sendMessage = "INSERT INTO message (message, toUser, fromUser, date, id) VALUES (?, ?, ?, ? ,?)";
const removeChat = "DELETE FROM message WHERE id = ?";

const addMessageNote = "INSERT INTO messageNote (fromUser, toUser, id) VALUES (?, ?, ?)";
const getAllMessageNote = "SELECT * FROM messageNote WHERE toUser = ?";
const deleteMessageNote = "DELETE FROM messageNote WHERE id = ?";
const getAllMessageNoteFromFriend = "SELECT * FROM messageNote WHERE (fromUser = ? AND toUser = ?)";
const getAllMessageNoteFromId = "SELECT * FROM messageNote WHERE id = ?";



class Database {
    /**Adds a task*/
    async addTask({ projectID, name, description }) {
        let id = await getNewId();
        let postDate = new Date();
        await connection.queryP(addTask, [name, description, 'BACKLOG', postDate, id, projectID])
    }
    /**Returns all tasks*/
    async getAllTasks(projectID) {
        if (projectID != undefined) {
            return await connection.queryP(getAllTasks, projectID);
        }
    }
    /**Returns single task*/
    async getTask(id) {
        return await connection.queryP(getTask, id);
    }
    async removeTask(id) {
        await connection.queryP(removeTask, id);
    }
    async removeAllTasks(projectID){
        await connection.queryP(removeAllTasks, projectID)
    }
    async editTask({ name, description, taskID }) {
        await connection.queryP(editTask, [name, description, taskID]);
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
    async deleteUserProject(projectID){
        await connection.queryP(deleteUserProject, projectID);
    }
    async deleteProject(id){
        await connection.queryP(deleteProject, id);
    }
    /**Adds a user to a project*/
    async addUserProject({ username, projectID }) {
        await connection.queryP(addUserProject, [username, projectID, true]);
    }
    async getUserProject({ username, projectID }) {
        return await connection.queryP(getUserProject, [username, projectID]);
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
    /**Verify that the user exists*/
    async verifyUser({ username, password }) {
        let user = await this.getUser(username);
        return user && user.length > 0 && bcryptjs.compare(password, user[0].password);
    }

    async getAllLogs(projectID) {
        return await connection.queryP(getAllLogsLimit100, projectID);
    }
    async addLog(html, projectID) {
        await connection.queryP(addLog, [html, projectID]);
    }
    async removeAllLogs(projectID){
        await connection.queryP(removeAllLogs, projectID);
    }
    async addComment({ author, content, postDate, taskID, projectID}) {
        await connection.queryP(addComment, [author, content, postDate, taskID, projectID]);
    }
    async getAllComments(taskID) {
        return await connection.queryP(getAllComments, taskID);
    }
    async removeAllComments(projectID){
        await connection.queryP(removeAllComments, projectID);
    }
    async addUserNote(username, fromUser, projectID, taskID) {
        if ((await this.getUserProject({ username, projectID })).length > 0)
            await connection.queryP(addUserNote, [username, fromUser, projectID, taskID, (await getNewId())])
    }
    async getAllUserNotes(username) {
        return await connection.queryP(getAllUserNotes, username)
    }
    async getAllUserNotesWithProject(username, projectID) {
        return await connection.queryP(getAllUserNotesWithProject, [username, projectID]);
    }
    async getAllUserNotesWithTask(username, taskID) {
        return await connection.queryP(getAllUserNotesWithTask, [username, taskID]);
    }
    async deleteUserNotesWithProjectID(projectID){
        await connection.queryP(deleteUserNotesWithProjectID, projectID)
    }
    async deleteUserNotes(taskID) {
        await connection.queryP(deleteUserNotes, taskID)
    }
    async sendInvite({ fromUser, toUser, projectID }) {
        if ((await this.getUserProject({ username: toUser, projectID })).length > 0 || (await this.getProjectInvitebyProjectID(projectID)).length > 0) {
            console.log("fround project or invite already")
            return false;
        }
        let project = (await this.getProject(projectID))[0];
        await connection.queryP(sendInvite, [fromUser, toUser, projectID, project.name, (await getNewId())]);
    }
    async getAllProjectInvites(username) {
        return await connection.queryP(getAllProjectInvites, username);
    }
    async getProjectInvite(id) {
        return await connection.queryP(getProjectInvite, id)
    }
    async getProjectInvitebyProjectID(projectID) {
        return await connection.queryP(getProjectInviteByProjectID, projectID);
    }
    async deleteProjectInvite(id) {
        await connection.queryP(deleteProjectInvite, id);
    }
    async deleteProjectInviteByProjectID(projectID){
        await connection.queryP(deleteProjectInviteByProjectID, projectID);
    }
    async sendFriendRequest({ fromUser, toUser }) {
        if (await this.getFriendId({ username: fromUser, friendUsername: toUser }) == "" || await this.getFriendRequestByFromUser(fromUser).length == 0 || fromUser != toUser)
            await connection.queryP(sendFriendRequest, [fromUser, toUser, (await getNewId())]);
    }
    async getAllFriendRequests(username) {
        return await connection.queryP(getAllFriendRequests, username);
    }
    async getFriendRequest(id) {
        return await connection.queryP(getFriendRequest, id)
    }
    async getFriendRequestByFromUser(fromUser) {
        return await connection.queryP(getFriendRequestByFromUser, fromUser)
    }
    async deleteFriendRequest(id) {
        await connection.queryP(deleteFriendRequest, id);
    }
    async addFriend({ username, friendUsername, id }) {
        await connection.queryP(addFriend, [username, friendUsername, id]);
    }
    async getAllFriends(username) {
        return await connection.queryP(getAllFriends, username);
    }
    async getFriendId({ username, friendUsername }) {
        let id = await connection.queryP(getFriendId, [username, friendUsername]);
        if (id.length > 0) id = id[0].id
        else return "";
        return id;
    }
    async removeFriend({username, friendUsername}){
        let id = await this.getFriendId({username, friendUsername});
        await connection.queryP(removeChat, id);
        await connection.queryP(removeFriend, [username, friendUsername]);
        await connection.queryP(removeFriend, [friendUsername, username]);
    }
    async getChat(id){
        return await connection.queryP(getChat, id);
    }
    async sendMessage({ message, toUser, fromUser, date, id }) {
        if(fromUser != null)
            await connection.queryP(sendMessage, [message, toUser, fromUser, date, id]);
    }
    async addMessegeNote({ fromUser, toUser, id }) {
        await connection.queryP(addMessageNote, [fromUser, toUser, id]);
    }
    async getAllMessageNote(toUser) {
        return await connection.queryP(getAllMessageNote, toUser);
    }
    async deleteMessageNote(id) {
        await connection.queryP(deleteMessageNote, id);
    }
    async getAllMessageNoteFromFriend({ fromUser, toUser }) {
        return await connection.queryP(getAllMessageNoteFromFriend, [fromUser, toUser])
    }
    async getAllMessageNoteFromId(id) {
        return await connection.queryP(getAllMessageNoteFromId, id);
    }
}
let Storage = new Database();
async function getNewId() {
    let a = "abcdefghijklmnopkqrtuvwxyzABCDEFGHIJKLMNOPKQRTUVWXYZ";
    let testId = "";
    for (let i = 0; i < 16; i++) {
        testId += a[Math.floor(Math.random() * a.length)];
    }

    if (await Storage.verifyProcjetID(testId)) {
        return testId;
    }
    return this.getNewId();
}
module.exports = Storage;
