var socket = io();

function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    const reg = /[&<>"'/]/gi;
    return string.replace(reg, match => map[match]);
}
//Cards
let BACKLOG = $('#BACKLOG');
let TODO = $('#TODO');
let INPROGRESS = $('#INPROGRESS');
let TOVERIFY = $('#TOVERIFY');
let DONE = $('#DONE');
let IMPEDIMENTS = $('#IMPEDIMENTS');
$(document).ready(function() {});
isEditing = false;
//Eventlistners
$('#submitTask').on('click', addTask);
$('#addComment').on('click', addComment);
$('#addUser').on('click', e => {
    e.preventDefault();
    addUser(sanitize($('#usernameAdd').val()));
    $('#usernameAdd').val('');
});
$('#addFriend').click(e => {
    e.preventDefault();
    let username = $('#usernameAddFriend');
    if (username.length > 0) {
        addFriend(sanitize($('#usernameAddFriend').val()));
        $('#usernameAddFriend').val('');
    }
});
$('#removeFriend').click(e => {
    e.preventDefault();
    let friend = $('.currentChat').attr('id');
    $('.currentChat').remove();
    socket.emit('removeFriend', friend);
});
$('#assign').click(e => {
    let projectID = $('.currentProject').attr('id');
    $('.assignUser').remove();
    socket.emit('assignUserInfo', projectID);
});
$('#addEvent').click(e => {
    let data = {
        start: $('#estart').val(),
        end: $('#eend').val(),
        title: $('#ename').val()
    };
    socket.emit('newEvent', data);
});

function addEventListenerToInvites() {
    $('.accept').click(function() {
        let inviteID = $(this)
            .parent()
            .attr('id');
        acceptProjectInvite(inviteID);
        $(this)
            .parent()
            .remove();
    });
    $('.decline').click(function() {
        let inviteID = $(this)
            .parent()
            .attr('id');
        declineProjectInvite(inviteID);
        $(this)
            .parent()
            .remove();
    });
    $('.acceptFriend').click(function() {
        let inviteID = $(this)
            .parent()
            .attr('id');
        acceptFriendRequest(inviteID);
        $(this)
            .parent()
            .remove();
    });
    $('.declineFriend').click(function() {
        let inviteID = $(this)
            .parent()
            .attr('id');

        declineFriendRequest(inviteID);
        $(this)
            .parent()
            .remove();
    });
}
addEventListenerToInvites();

function addEventListenersToFriends() {
    $('.friend').click(function() {
        $('.inputAndBtnChatHide').removeClass('inputAndBtnChatHide');
        $('.currentChat').removeClass('currentChat');
        $(this)
            .children()
            .addClass('currentChat');
        socket.emit(
            'newChat',
            $(this)
            .children()
            .attr('id')
        );
        updateMessageBadge();
    });
}

$('#removeUserAssign').click(() => {
    let tID = $('.currentTask').attr('id');
    socket.emit('removeUserAssign', tID);
});

addEventListenersToFriends();
$('#addMessage').on('click', function() {
    let data = {
        message: sanitize($('#Message').val()),
        toUser: $('.currentChat').attr('id')
    };
    if (data.message == '') return;
    $('#allMessages').append(
        `<div class="message sb1"><p class="fromUser">${data.message}</p></div>`
    );
    $('#Message').val('');
    socket.emit('addMessage', data);
    scrollAllWayDown('allMessages');
});
$('#remove').click(removeTask);
$('#showForm').click(() => {
    if ($('.currentTask').length > 0) {
        isEditing = false;
        $('#taskNameInput').val('');
        $('#taskDescriptionInput').val('');
        $('#form').toggleClass('hide');
        $('#taskDesc').toggleClass('hide');
        $('#comments').toggleClass('hide');
    }
});
$('#edit').click(editTask);
$('#removeProject').click(e => {
    e.preventDefault();
    let data = {
        inputProjectName: $('#projectRemove').val(),
        projectID: $('.currentProject').attr('id')
    };
    socket.emit('removeProject', data);
});
$('#editPersonalDetails').click(e => {
    if ($('#userForm').hasClass('hide')) $('#userForm').removeClass('hide');
    else $('#userForm').addClass('hide');
});
$('#editPersonalDetailsUpdate').click(e => {
    if (!$('#userForm').hasClass('hide')) {
        let data = {
            newFirstname: $('input[name=newFirstname]').val(),
            newLastname: $('input[name=newLastname]').val(),
            newEmail: $('input[name=newEmail]').val(),
            currentPassword: $('input[name=currentPassword]').val(),
            newPassword: $('input[name=newPassword]').val(),
            newConfirmpassword: $('input[name=newConfirmpassword]').val()
        };
        let fail = false;
        if (!data.currentPassword) {
            fail = true;
            $('input[name=currentPassword]').addClass('missing-info');
        }
        if (!validateEmail($('input[name=newEmail]').val())) {
            fail = true;
            $('input[name=newEmail]').addClass('missing-info');
        }
        if (fail) return;
        $.ajax({
            type: 'POST',
            url: '/updateUser',
            data: data,
            withCredentials: true
        }).done(res => {
            if (res) location.href = '/user';
            else $('input[name=currentPassword]').addClass('missing-info');
        });
    }
});

$('#addWebhook').click(e => {
    let url = $('#newUrl').val();
    $('#newUrl').removeClass('is-invalid');
    var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);

    if (!url.match(regex)) {
        $('#newUrl').addClass('is-invalid');
        setTimeout(() => {
            $('#newUrl').removeClass('is-invalid');
        }, 5000);
        return;
    }

    socket.emit('newWebhook', {
        url,
        projectID: $('.currentProject').attr('id')
    });
});

$('#webhookModal').on('shown.bs.modal', function() {
    socket.emit('getWebhooks', $('.currentProject').attr('id'));
});

//ReviceEvent
socket.on('allTasks', allTasks);
socket.on('goUpdate', goUpdate);
socket.on('infoAboutTask', infoAboutTask);
socket.on('log', log);
socket.on('updateLog', updateLog);
socket.on('updateComments', updateComments);
socket.on('showComment', showComment);
socket.on('onlinePeople', onlinePeople);
socket.on('allGood', allGood);
socket.on('moveThisTask', moveThisTask);
socket.on('yourProjects', yourProjects);
socket.on('updateProject', updateProject);
socket.on('showChat', showChat);
socket.on('liveChat', liveChat);
socket.on('yourNotes', yourNotes);
socket.on('updateInvites', updateInvites);
socket.on('yourBadges', yourBadges);
socket.on('removeFriend', removeFriend);
socket.on('addFriendToList', addFriendToList);
socket.on('href', href);
socket.on('updateCurrentTask', updateCurrentTask);
socket.on('assignUserInfo', assignUserInfo);
socket.on('calendarData', calendarData);
socket.on('areYouAdmin', areYouAdmin);
socket.on('webhooks', webHooks);
/**
 * Adds a task
 */
function addTask() {
    let data = {};
    data.projectID = $('.currentProject').attr('id');
    data.taskID = $('.currentTask').attr('id');
    let fail = false;
    if (sanitize($('#taskNameInput').val()) != '') {
        data.name = sanitize($('#taskNameInput').val());
    } else {
        $('#taskNameInput').addClass('missing-info');
        fail = true;
    }

    if (sanitize($('#taskDescriptionInput').val()) != '') {
        data.description = sanitize($('#taskDescriptionInput').val());
        $('#taskDescriptionInput').val('');
    } else {
        $('#taskDescriptionInput').addClass('missing-info');
        fail = true;
    }

    setTimeout(() => {
        $('#taskDescriptionInput').removeClass('missing-info');
        $('#taskNameInput').removeClass('missing-info');
    }, 5000);

    if (!fail) {
        if (isEditing) {
            socket.emit('editTask', data);
        } else socket.emit('newTask', data);
        $('#taskNameInput').val('');
        $('#taskDescriptionInput').val('');
    }
}
/**
 * moves a task
 * @param {element} element element of the fask
 * @param {string} taskID id of the task
 */
function move(element, taskID) {
    socket.emit('moveTask', {
        state: element,
        id: taskID,
        projectID: $('.currentProject').attr('id')
    });
}
/**
 * Adds a new project
 * @param {string} name name of prorject
 * @param {string} desc description of project
 */
async function addProject(name) {
    socket.emit('addProject', { name });
}
/**
 * adds a comment
 */
function addComment() {
    let data = {
        content: sanitize($('#Comment').val()),
        taskID: $('.currentTask').attr('id'),
        projectID: $('.currentProject').attr('id')
    };
    $('#Comment').val('');
    if (data.content != '') socket.emit('addComment', data);
}
/**
 * Sends invite to a project.
 * @param {string} username a string of usernames that is divided by ','
 */
function addUser(username) {
    let data = {
        users: sanitize(username)
            .replace(/ /g, '')
            .split(','),
        projectID: $('.currentProject').attr('id')
    };
    socket.emit('addUser', data);
}
/**
 * Sends a friend request to specifed username
 * @param {string} username the username of the friend you want to add
 */
function addFriend(username) {
    socket.emit('addFriend', username);
}
/**
 * Appends project in sidebar.
 * @param {object} obj a project
 */
function appendThisProject(obj) {
    let projects = $('.yourProjects');
    let id = window.location.href.split('/');
    id = id[id.length - 1];
    let displayName = obj.name.substring(0, 2).toUpperCase();
    projects.append(` <div class="project" id="${
		obj.id
		}" class="btn btn-secondary" data-toggle="tooltip" data-placement="right"
                title="${obj.name}">
                <p>${obj.name.substring(0, 2).toUpperCase()}</p>
                <span class="badge notes">${obj.notes}</span>
            </div > `);
    $('#' + obj.id).tooltip({ boundary: 'window' });
    if (obj.id == id) {
        $('#' + obj.id).addClass('currentProject');
    }
}
/**
 * Adds a task to the board.
 * @param {object} obj a task
 * @param {element} element a html element
 */
function addToBoard(obj, element) {
    let color = obj.assignColor ? 'background:' + obj.assignColor : '';
    $(element).append(
        `<li style="${color}"id="${obj.id}" draggable="true" ondragstart="drag(event)" class="list-group-item taskItem border"><span class="taskName" id="${obj.name}">${obj.name}</span><span class="badge taskNotes">${obj.notes}</span><p  draggable="false" name="${obj.description}"class="hidden desc"></p></li>`
    );
    let newTask = document.getElementById(obj.id);
    addNewEventListeners(newTask);
    let hasBeenCut = false;
    let targetWidth = Math.floor(
        $(document.getElementsByClassName('taskItem')[0]).width()
    );
    let fontSize = $(document.getElementsByClassName('desc')[0]).css(
        'font-size'
    );
    let desc = obj.description;
    while (measureText(desc, fontSize, '').width >= targetWidth) {
        desc = desc.substring(0, desc.length - 3);
        hasBeenCut = true;
    }
    if (hasBeenCut) {
        desc = desc.substring(0, desc.length - 3) + '...';
    }

    $('#' + obj.id + ' p').html(desc);
    hasBeenCut = false;
    targetWidth = Math.floor(
        $(document.getElementsByClassName('taskItem')[0]).width()
    );
    fontSize = $(document.getElementsByClassName('taskName')[0]).css(
        'font-size'
    );
    let name = obj.name;
    while (measureText(name, fontSize, '').width >= targetWidth) {
        name = name.substring(0, name.length - 3);
        hasBeenCut = true;
    }
    if (hasBeenCut) {
        name = name.substring(0, name.length - 3) + '...';
    }
    $('#' + obj.id + ' .taskName').html(name);
}

$('#removeEvent').click(function() {
    let el = $(this);
    socket.emit('removeThisEvent', $(el[0]).attr('data-target'));
    let e = window.calendar.getEvents();
    for (let i in e) {
        if (e[i].id == $(el[0]).attr('data-target')) e[i].remove();
    }
});

/**
 * Scrolls all the way down on a html element
 * @param {Number} elementID an id for a html element
 */
function scrollAllWayDown(elementID) {
    let chatHistory = document.getElementById(elementID);
    if (chatHistory != null) chatHistory.scrollTop = chatHistory.scrollHeight;
}

function acceptProjectInvite(inviteID) {
    socket.emit('acceptProjectInvite', inviteID);
}

function declineProjectInvite(inviteID) {
    socket.emit('declineProjectInvite', inviteID);
}

function acceptFriendRequest(inviteID) {
    socket.emit('acceptFriendRequest', inviteID);
}

function declineFriendRequest(inviteID) {
    socket.emit('declineFriendRequest', inviteID);
}
/**
 * emptys all cardHolders that contain tasks and print out the new tasks
 * @param {object} data new tasks
 */
function allTasks(data) {
    let currentTask = $('.currentTask');
    if (currentTask.length > 0) currentTask = $('.currentTask').attr('id');
    BACKLOG.empty();
    TODO.empty();
    INPROGRESS.empty();
    TOVERIFY.empty();
    DONE.empty();
    IMPEDIMENTS.empty();
    for (let i in data) {
        let obj = data[i];
        switch (obj.state) {
            case 'BACKLOG':
                addToBoard(obj, BACKLOG);
                break;
            case 'TODO':
                addToBoard(obj, TODO);
                break;
            case 'INPROGRESS':
                addToBoard(obj, INPROGRESS);
                break;
            case 'TOVERIFY':
                addToBoard(obj, TOVERIFY);
                break;
            case 'DONE':
                addToBoard(obj, DONE);
                break;
            case 'IMPEDIMENTS':
                addToBoard(obj, IMPEDIMENTS);
                break;
        }
    }
    if (currentTask.length > 0) $('#' + currentTask).addClass('currentTask');
}
/**
 * updates all the tasks with the currentProject
 * @param {object} data Not used
 */
function goUpdate(data) {
    let projectID = $('.currentProject').attr('id');
    if (!projectID) {
        setTimeout(() => {
            goUpdate(data);
        }, 50);
        return;
    }
    socket.emit('needTasks', projectID);
    socket.emit('myProjects');
    socket.emit('updateNotesList');
    socket.emit('updateCalendar', projectID);
    return;
}
/**
 * shows new info about a task and show new comments
 * @param {Object} data Both tasks and comments in a object
 */
function infoAboutTask(data) {
    $('#infoName').html('Name: ' + data.task.name);
    $('#infoDesc').html('Description: ' + data.task.description);
    $('#infoState').html('State: ' + data.task.state);
    $('#infoPostdate').html('Date: ' + data.task.postDate);

    if (data.assigned[0])
        $('#infoProjectId').html(
            'Assiged to: <b>@' + data.assigned[0].username + '</b>'
        );
    else $('#infoProjectId').empty();
    $('#allComments').empty();
    for (i in data.comments) {
        i = data.comments[i];
        $('#allComments').append(
            `<div class="comment border"><h6>@${i.author}</h6><p class="commentContent">${i.content}</p></div>`
        );
    }
    scrollAllWayDown('allComments');
}
/**
 * Shows the new added log
 * @param {element} element a html element
 */
function log(element) {
    $('#log').append(element);
    scrollAllWayDown('log');
}
/**
 * emptys all comments and adds new tasks, used when pressed on a new project.
 * @param {object} data The data of the new logs
 */
function updateLog(data) {
    $('#log').empty();
    for (i in data) $('#log').append(data[i].html);
    scrollAllWayDown('log');
}
/**
 * emptys all comments and adds new comments, used when pressed on a new task.
 * @param {object} data The data of comments on a specific task.
 */
function updateComments(data) {
    $('#allComments').empty();
    for (i in data)
        $('#allComments').append(
            `<div class="comment border"><h6>@${data[i].author}</h6><p class="commentContent">${data[i].content}</p></div>`
        );
}
/**
 * shows the new comment and scrolls all the way down on the comment scroll.
 * @param {object} data The data of a new comment that was added recently
 */
function showComment(data) {
    $('#allComments').append(
        `<div class="comment border"><h6>@${data.author}</h6><p class="commentContent">${data.content}</p></div>`
    );
    scrollAllWayDown('allComments');
}
/**Shows online people
 * @param {Number} data Number of users online
 */
function onlinePeople(onlineusers) {
    $('#online').html('Online: ' + onlineusers);
}
/**removes modals when finished with them
 * @param {object} data Not used
 */
function allGood(data) {
    $('#myModal').modal('hide');
    $('#addUserModal').modal('hide');
    $('#removeFriendModal').modal('hide');
}
/**moves a task when dragged and dropped
 * @param {object} data The data of a task
 */
function moveThisTask(data) {
    let oldTask = $('#' + data.id);
    switch (data.state) {
        case 'BACKLOG':
            BACKLOG.append(oldTask);
            break;
        case 'TODO':
            TODO.append(oldTask);
            break;
        case 'INPROGRESS':
            INPROGRESS.append(oldTask);
            break;
        case 'TOVERIFY':
            TOVERIFY.append(oldTask);
            break;
        case 'DONE':
            DONE.append(oldTask);
            break;
        case 'IMPEDIMENTS':
            IMPEDIMENTS.append(oldTask);
            break;
    }
}
/**lists all yourt projects on the left hand side on the website.
 * @param {object} data a list of all projects from the user
 */
function yourProjects(data) {
    $('.yourProjects')
        .children('div')
        .remove();
    let page = window.location.href.split('/');
    let startID = page[page.length - 1];
    page = page[page.length - 2];
    for (let i in data) {
        let obj = data[i];
        appendThisProject(obj);
        if (obj.id == startID) {
            socket.emit('needTasks', obj.id);
            $('#title').html(obj.name);
        }
        $('#' + obj.id).on('click', () => {
            if (page == 'dashboard') {
                $('#form').removeClass('hide');
                $('#taskDesc').addClass('hide');
                $('#comments').addClass('hide');
                let project = $('#' + obj.id);
                socket.emit('needTasks', obj.id);
                socket.emit('currentProject', obj.id);
                $('#title').html(obj.name);
                $('.currentProject').removeClass('currentProject');
                project.addClass('currentProject');
                history.pushState('', obj.name, '/dashboard/' + obj.id);
            } else {
                window.location.href = '/dashboard/' + obj.id;
            }
        });
    }
}
/**updates notifications on projects
 * @param {object} data a list of all projects from the user.
 */
function updateProject(data) {
    for (let i in data) {
        let notes = $('#' + data[i].id + ' span');
        if (notes != data[i].notes) {
            notes.html(data[i].notes);
        }
    }
}

function showChat(data) {
    let user = $('.user').attr('id');
    let allMessages = $('#allMessages');
    $('#allMessages').empty();
    for (i in data) {
        if (data[i].fromUser == user) {
            allMessages.append(
                `<div class="message sb1"><p class="fromUser">${data[i].message}</p></div>`
            );
        } else {
            allMessages.append(
                `<div class="message sb2"><p class="toUser"><b>@${data[i].fromUser}:</b>${data[i].message}</p></div>`
            );
        }
    }
    scrollAllWayDown('allMessages');
}

function liveChat(data) {
    updateMessageBadge();
    if (
        $('.currentChat').length > 0 &&
        $('.currentChat').attr('id') == data.fromUser
    ) {
        socket.emit('removeMessageNotes', $('.currentChat').attr('id'));
        let allMessages = $('#allMessages');
        allMessages.append(
            `<div class="message sb2"><p class="toUser"><b>@${data.fromUser}:</b>${data.message}</p></div>`
        );
        scrollAllWayDown('allMessages');
    } else {
        displayNotification(data);
    }

    function displayNotification(data) {
        notifications = $('#notifications');
        let id = getNewId();
        notifications.append(`<div id="${id}" style="display:none" class="alert notification alert-info">Message from @${data.fromUser}: <span></span>  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
        </div>`);
        $('#' + id).alert();
        hasBeenCut = false;
        targetWidth = Math.floor(notifications.width());
        fontSize = $(document.getElementById('notifications')[0]).css(
            'font-size'
        );
        let msg = data.message;
        let msgLength = measureText(
            `Message from @${data.fromUser}: ` + msg,
            fontSize,
            ''
        ).width;
        while (msgLength >= targetWidth) {
            msgLength = measureText(
                `Message from @${data.fromUser}: ` + msg,
                fontSize,
                ''
            ).width;
            msg = msg.substring(0, msg.length - 3);
            hasBeenCut = true;
        }
        if (hasBeenCut) {
            msg = msg.substring(0, msg.length - 3) + '...';
        }
        //$('#' + data.date + " span").html(msg);
        document.querySelector('#' + id + ' span').innerHTML = msg;
        let element = $('#' + id);
        element.fadeIn('slow');
        setTimeout(() => {
            element.fadeOut('slow', () => {
                element.remove();
            });
        }, 5000);
    }

    function getNewId() {
        let a = 'abcdefghijklmnopkqrtuvwxyzABCDEFGHIJKLMNOPKQRTUVWXYZ';
        let testId = '';
        for (let i = 0; i < 32; i++) {
            testId += a[Math.floor(Math.random() * a.length)];
        }
        return testId;
    }
}

function areYouAdmin(data) {
    let btn = $('#delProject');
    let btn2 = $('#webhookBtn');
    if (data) {
        //Toggle del btn
        btn.show();
        btn2.show();
    } else {
        //hide del btn
        btn.hide();
        btn2.hide();
    }
}

function removeTask() {
    let data = {
        taskID: $('.currentTask').attr('id'),
        projectID: $('.currentProject').attr('id')
    };
    socket.emit('removeTask', data);
}

function editTask() {
    let desc = $('.currentTask p').attr('name');
    let name = $('.currentTask .taskName').attr('id');
    $('#taskNameInput').val(name);
    $('#taskDescriptionInput').val(desc);
    $('#form').removeClass('hide');
    $('#taskDesc').addClass('hide');
    $('#comments').addClass('hide');
    isEditing = true;
}

function updateCurrentTask() {
    $('.currentTask taskNotes').empty();
    socket.emit('updateNotesList');
    socket.emit('myProjects');
}

function yourNotes(data) {
    let list = $('#userNotesDropdown');
    let icon = $('#dropdownMenu2 i');
    let number = $('#dropdownMenu2 span');

    list.empty();
    if (data.allMessageNotes && data.allMessageNotes > 1)
        list.append(
            `<a class="dropdown-item" href="/user">You have <b>${data.allMessageNotes}</b> new messages!</a>`
        );
    else if (data.allMessageNotes)
        list.append(
            `<a class="dropdown-item" href="/user">You have <b>${data.allMessageNotes}</b> new message!</a>`
        );
    for (let i in data.projectAndTaskNotes) {
        let obj = data.projectAndTaskNotes[i];
        list.append(
            `<a class="dropdown-item" href="/dashboard/${obj.projectID}"><b>@${obj.fromUser}</b> tagged you in a project!</a>`
        );
    }
    for (let i in data.allInvites) {
        let obj = data.allInvites[i];
        list.append(
            `<a class="dropdown-item" href="/user"><b>@${obj.fromUser}</b> has invited you to the project ${obj.projectName}</a>`
        );
    }
    for (let i in data.allFriendRequests) {
        let obj = data.allFriendRequests[i];
        list.append(
            `<a class="dropdown-item" href="/user">Friend Request From <b>@${obj.fromUser}</b></a>`
        );
    }

    number.html(list.children().length);
    number.css('color', '#85FFFE');

    if (list.children().length == 0) {
        list.append(`<a class="dropdown-item" href="#">No notifications</a>`);
        icon.css('color', 'darkslategrey');
    } else {
        icon.css('color', 'red');
    }

    //USER ICON

    let userIconNotes = $('#userIconNotes');
    let userNotes =
        data.allInvites.length +
        data.allFriendRequests.length +
        data.allMessageNotes;
    if (userNotes == 0) userNotes = '';
    userIconNotes.text(userNotes);
}

function removeFriend(friend) {
    $('#' + friend).remove();
}

function href(path) {
    window.location.href = path;
}

function updateInvites(data) {
    $('#invites')
        .children('div')
        .remove();
    $('#friendInvites')
        .children('div')
        .remove();
    for (i in data.projectInvites) {
        let invite = data.projectInvites[i];
        $('#invites').append(
            `<div id=${invite.id} class="invite border"><b>@${invite.fromUser}</b> invited you to their project called ${invite.projectName}!<button type="button" class="badge choice accept btn btn-outline-primary"><i class="fas fa-check fa-2x"></i></button><button type="button"class="badge choice decline btn btn-outline-primary"><i class="fas fa-ban fa-2x"></i></button></div>`
        );
    }
    for (i in data.friendRequests) {
        let invite = data.friendRequests[i];
        $('#friendInvites').append(
            `<div id=${invite.id} class="invite border"><b>@${invite.fromUser}</b> sent a friend request!<button type="button" class="badge choice acceptFriend btn btn-outline-primary"><i class="fas fa-check fa-2x"></i></button><button type="button"class="badge choice declineFriend btn btn-outline-primary"><i class="fas fa-ban fa-2x"></i></button></div>`
        );
    }
    addEventListenerToInvites();
}

function assignUserInfo(users) {
    users.forEach(user => {
        $('#assignUsers').append(
            `<button style="background:${user.color}; border:0;"class="btn btn-primary assignUser" id="${user.username}">${user.username}</button>`
        );
    });
    $('.assignUser').click(e => {
        e.preventDefault();
        let data = {
            username: $(e.target).attr('id'),
            taskID: $('.currentTask').attr('id'),
            projectID: $('.currentProject').attr('id')
        };
        socket.emit('assignUser', data);
    });
}

function yourBadges(data) {
    let friends = $('.friend span:nth-child(2)');
    friends.each(function(i) {
        if (data[i].notes == 0) {
            $(this).hide();
        } else {
            $(this).show();
            $(this).text(data[i].notes);
        }
    });
}
/**Adds new eventlistner on a the task as it comes in.
 * @param {htmlElement} data -jquery element that
 */
function addNewEventListeners(newTask) {
    newTask.addEventListener('mouseenter', () => {
        let id = $(newTask).attr('id');
        $('#' + id + ' p').removeClass('hidden');
    });
    newTask.addEventListener('mouseleave', () => {
        let id = $(newTask).attr('id');
        $('#' + id + ' p').addClass('hidden');
    });

    newTask.addEventListener('click', () => {
        let id = $(newTask).attr('id');
        socket.emit('moreInfo', id);
        socket.emit('updateNotesList');
        $('.currentTask').removeClass('currentTask');
        $(newTask).addClass('currentTask');
        $('#form').addClass('hide');
        $('#taskDesc').removeClass('hide');
        $('#comments').removeClass('hide');
    });
}

function measureText(pText, pFontSize, pStyle) {
    var lDiv = document.createElement('div');

    document.body.appendChild(lDiv);

    if (pStyle != null) {
        lDiv.style = pStyle;
    }
    lDiv.style.fontSize = '' + pFontSize + 'px';
    lDiv.style.position = 'absolute';
    lDiv.style.left = -1000;
    lDiv.style.top = -1000;

    lDiv.innerHTML = pText;

    var lResult = {
        width: lDiv.clientWidth,
        height: lDiv.clientHeight
    };

    document.body.removeChild(lDiv);
    lDiv = null;

    return lResult;
}

function webHooks(wh) {
    let parrent = $('.currentWebhooks');
    parrent.html('');
    for (let i in wh) {
        parrent.append(
            `<button style="border:0;"class="btn btn-primary webhookItem" data-toggle="tooltip" title="${wh[i].url}" id="wh${wh[i].id}">${wh[i].id}</button>`
        );
        $('#wh' + wh[i].id).click(e => {
            socket.emit('removeWebhook', wh[i].id);
        });
    }
}

function updateMessageBadge() {
    let friends = $('.friend span:nth-child(1)');
    let data = [];
    friends.each(function() {
        let friend = $(this).attr('id');
        data.push(friend);
    });
    socket.emit('getFriendNotes', data);
}

function addFriendToList(data) {
    $('#friends').append(
        `<div class="friend"><span class="input-group-text" id="${data.friend}"><i class="fas fa-at"></i>${data.friend} <span class=" badge badge-light" style="display: none;"></span><button data-toggle="modal" data-target="#removeFriendModal" type="button" class="badge choice removeFriend btn btn-outline-primary right" style="margin:0;"><i class="fas fa-ban"></i></button></span></div>`
    );
    addEventListenersToFriends();
}

function calendarData(data) {
    window.calendar.removeAllEvents();
    for (let i in data) {
        window.calendar.addEvent(data[i]);
    }
}

function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}