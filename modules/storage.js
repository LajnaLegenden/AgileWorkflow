
let connection = require("./mysql");
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
const getAllUserWithProjectID = "SELECT * FROM userProject WHERE projectID = ?";

const getProjectAsign = "SELECT * FROM projectAsign WHERE username = ? AND projectID = ?";
const makeProjectAsign = "INSERT INTO projectAsign (R,G,B,projectID, username) VALUES (?,?,?,?,?)"
const deleteProjectAsign = "DELETE FROM projectAsign WHERE projectID = ?";


const makeTaskAsign = "INSERT INTO taskAsign (taskID, projectID, username) VALUES (?,?,?)";
const getTaskAsignByTaskID = "SELECT * FROM taskAsign WHERE taskID = ?";
const deleteTaskAsign = "DELETE FROM taskAsign WHERE taskID = ?";
const deleteAllTaskAsign = "DELETE FROM taskAsign WHERE projectID = ?";

const getUser = "SELECT * FROM user WHERE username = ?"
const addUser = "INSERT INTO user (username, password, firstname, lastname, email, projects) VALUES (?, ?, ?, ?, ?, ?)"
const updateUser = "UPDATE user SET firstname = ?, lastname = ?, email = ?, password = ? WHERE username = ?";
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
const getProjectInviteByProjectIDAndUsername = "SELECT * FROM inviteProject WHERE (projectID = ? AND toUser = ?)";
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

const addNewEvent = "INSERT INTO events (start,end,title,id,projectID) VALUES (?,?,?,?,?)";
const getCalendarEvents = "SELECT * FROM events WHERE projectID = ?"
const removeEvent = "DELETE FROM events WHERE id = ?";


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
        await connection.queryP(deleteTaskAsign, id);
    }
    async removeAllTasks(projectID) {
        await connection.queryP(removeAllTasks, projectID)
        await connection.queryP(deleteAllTaskAsign, projectID);
        await connection.queryP(deleteProjectAsign, projectID);
    }
    async editTask({ name, description, taskID }) {
        await connection.queryP(editTask, [name, description, taskID]);
    }
    async makeTaskAsign({ taskID, projectID, username }) {
        await connection.queryP(deleteTaskAsign, taskID);
        await connection.queryP(makeTaskAsign, [taskID, projectID, username])
    }
    async getTaskAsignByTaskID(taskID) {
        return await connection.queryP(getTaskAsignByTaskID, taskID);
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
    async deleteUserProject(projectID) {
        await connection.queryP(deleteUserProject, projectID);
    }
    async deleteProject(id) {
        await connection.queryP(deleteProject, id);
    }
    /**Adds a user to a project*/
    async addUserProject({ username, projectID }) {
        await connection.queryP(addUserProject, [username, projectID, true]);
    }
    async getProjectAsign({ projectID, username }) {
        return await connection.queryP(getProjectAsign, [username, projectID])
    }
    async makeProjectAsign({ projectID, username }) {
        let R = Math.round(Math.random() * 255);
        let G = Math.round(Math.random() * 255);
        let B = Math.round(Math.random() * 255);
        await connection.queryP(makeProjectAsign, [R, G, B, projectID, username])
        return await this.getProjectAsign({ projectID, username });
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
    async updateUser({newFirstname, newLastname, newEmail, newPassword, username}){
        return await connection.queryP(updateUser, [newFirstname, newLastname, newEmail, await bcryptjs.hash(newPassword, 10), username]);
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
    async removeAllLogs(projectID) {
        await connection.queryP(removeAllLogs, projectID);
    }
    async addComment({ author, content, postDate, taskID, projectID }) {
        await connection.queryP(addComment, [author, content, postDate, taskID, projectID]);
    }
    async getAllComments(taskID) {
        return await connection.queryP(getAllComments, taskID);
    }
    async removeAllComments(projectID) {
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
    async deleteUserNotesWithProjectID(projectID) {
        await connection.queryP(deleteUserNotesWithProjectID, projectID)
    }
    async deleteUserNotes(taskID) {
        await connection.queryP(deleteUserNotes, taskID)
    }
    async sendInvite({ fromUser, toUser, projectID }) {
        if ((await this.getUserProject({ username: toUser, projectID })).length > 0 || (await this.getProjectInvitebyProjectIDAndUsername(projectID, toUser)).length > 0) {
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
    async getProjectInvitebyProjectIDAndUsername(projectID, toUser) {
        return await connection.queryP(getProjectInviteByProjectIDAndUsername, [projectID, toUser]);
    }
    async deleteProjectInvite(id) {
        await connection.queryP(deleteProjectInvite, id);
    }
    async deleteProjectInviteByProjectID(projectID) {
        await connection.queryP(deleteProjectInviteByProjectID, projectID);
    }
    async sendFriendRequest({ fromUser, toUser }) {
        if (await this.getFriendId({ username: fromUser, friendUsername: toUser }) == "" && fromUser != toUser)
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
    async removeFriend({ username, friendUsername }) {
        let id = await this.getFriendId({ username, friendUsername });
        await connection.queryP(removeChat, id);
        await connection.queryP(removeFriend, [username, friendUsername]);
        await connection.queryP(removeFriend, [friendUsername, username]);
    }
    async getChat(id) {
        return await connection.queryP(getChat, id);
    }
    async sendMessage({ message, toUser, fromUser, date, id }) {
        if (fromUser != null)
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
    async getAllUserWithProjectID(projectID) {
        return await connection.queryP(getAllUserWithProjectID, projectID);
    }

    async addNewEvent(title, start, end, pid) {
        let id = await getNewId();

        return await connection.queryP(addNewEvent, [start, end, title, id, pid]);
    }

    async getCalendarEvents(pID) {
        return connection.queryP(getCalendarEvents, pID);
    }

    async removeEvent(id) {
        await connection.queryP(removeEvent, id);
    }

    async removeUserAssign(tID) {
        return await connection.queryP(deleteTaskAsign, tID);
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
