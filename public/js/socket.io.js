var socket = io();

//Cards
let BACKLOG = $('#BACKLOG');
let TODO = $('#TODO');
let INPROGRESS = $('#INPROGRESS');
let TOVERIFY = $('#TOVERIFY');
let DONE = $('#DONE');
let IMPEDIMENTS = $('#IMPEDIMENTS');
$(document).ready(() => {
});

function addNewEventListeners(newTask) {
    newTask.addEventListener('mouseenter', () => {
        let id = $(newTask).attr('id');
        $('#' + id + " p").removeClass('hidden');

    });
    newTask.addEventListener('mouseleave', () => {
        let id = $(newTask).attr('id');
        $('#' + id + " p").addClass('hidden');
    });

    newTask.addEventListener('click', () => {
        let id = $(newTask).attr('id');

        socket.emit('moreInfo', id);
        $(".currentTask").removeClass("currentTask");
        $(newTask).addClass("currentTask");
        $("#form").addClass("hide");
        $("#taskDesc").removeClass("hide");
        $("#comments").removeClass("hide");
    });
}
isEditing = false;
//Eventlistners
$('#submitTask').on('click', addTask);
$("#addComment").on("click", addComment);
$("#addUser").on("click", e => {
    e.preventDefault();
    addUser($("#usernameAdd").val());
});
$(".accept").click(function () {
    let inviteID = $(this).parent().attr("id")
    acceptProjectInvite(inviteID)
    $(this).parent().remove();
});
$(".decline").click(function () {
    let inviteID = $(this).parent().attr("id")
    declineProjectInvite(inviteID)
    $(this).parent().remove();
});




//ReviceEvent
socket.on('allTasks', (data) => {
    //Empty
    let currentTask = $(".currentTask")
    if (currentTask.length > 0) currentTask = $(".currentTask").attr("id");
    BACKLOG.empty();
    TODO.empty();
    INPROGRESS.empty();
    TOVERIFY.empty();
    DONE.empty();
    IMPEDIMENTS.empty();
    for (let i in data) {
        let obj = data[i];
        switch (obj.state) {
            case "BACKLOG":
                addToBoard(obj, BACKLOG);
                break;
            case "TODO":
                addToBoard(obj, TODO);
                break;
            case "INPROGRESS":
                addToBoard(obj, INPROGRESS);
                break;
            case "TOVERIFY":
                addToBoard(obj, TOVERIFY);
                break;
            case "DONE":
                addToBoard(obj, DONE);
                break;
            case "IMPEDIMENTS":
                addToBoard(obj, IMPEDIMENTS);
                break;
        }
    }
    if (currentTask.length > 0) $("#" + currentTask).addClass("currentTask");
    function addToBoard(obj, element) {
        $(element).append(`<li id="${obj.id}" draggable="true" ondragstart="drag(event)" class="list-group-item taskItem border">${obj.name}<span class="badge taskNotes">${obj.notes}</span><p  draggable="false" class="hidden desc">${obj.description}</p></li>`);
        let newTask = document.getElementById(obj.id);
        addNewEventListeners(newTask);

        function measureText(pText, pFontSize, pStyle) {
            var lDiv = document.createElement('div');

            document.body.appendChild(lDiv);

            if (pStyle != null) {
                lDiv.style = pStyle;
            }
            lDiv.style.fontSize = "" + pFontSize + "px";
            lDiv.style.position = "absolute";
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
        let hasBeenCut = false;
        let targetWidth = Math.floor($(document.getElementsByClassName('desc')[0]).width());
        let fontSize = $(document.getElementsByClassName('desc')[0]).css('font-size');
        let desc = obj.description;
        while (measureText(desc, fontSize, "").width >= targetWidth) {
            desc = desc.substring(0, desc.length - 3);
            hasBeenCut = true;
        }
        if (hasBeenCut) {
            desc = desc.substring(0, desc.length - 3) + "...";
        }
        $('#' + obj.id + ' p').html(desc);

    }
});

socket.on('goUpdate', (data) => {
    let projectID = $(".currentProject").attr("id")
    socket.emit('needTasks', projectID);
});

socket.on('infoAboutTask', (data) => {
    let name = $('#infoName').html("Name: " + data.task.name);
    let desc = $('#infoDesc').html("Description: " + data.task.description);
    let state = $('#infoState').html("State: " + data.task.state);
    let postdate = $('#infoPostdate').html("Date: " + data.task.postDate);
    let pID = $('#infoProjectId').html("Project ID " + data.task.projectID);
    $("#allComments").empty();
    for (comment in data.comments) {
        comment = data.comments[comment];
        $("#allComments").append(`<div class="comment border"><h6>@${comment.author}</h6><p class="commentContent">${comment.content}</p></div>`)
    }
    scrollAllWayDown("allComments");
});

socket.on('log', async (data) => {
    let element = data;
    $('#log').append(element);
    scrollAllWayDown("log");
});
socket.on("updateLog", data => {
    $('#log').empty();
    for (i in data)
        $('#log').append(data[i].html);
    scrollAllWayDown("log");
});
socket.on("showComment", data => {
    $("#allComments").append(`<div class="comment border"><h6>@${data.author}</h6><p class="commentContent">${data.content}</p></div>`)
    scrollAllWayDown("allComments");
});

socket.on('onlinePeople', onlineusers => {
    $('#online').html("Online: " + onlineusers);
});

socket.on('allGood', function () {
    $('#myModal').modal('hide');
});

socket.on('moveThisTask', data => {
    let oldTask = $('#' + data.id);
    switch (data.state) {
        case "BACKLOG":
            BACKLOG.append(oldTask)
            break;
        case "TODO":
            TODO.append(oldTask)
            break;
        case "INPROGRESS":
            INPROGRESS.append(oldTask)
            break;
        case "TOVERIFY":
            TOVERIFY.append(oldTask)
            break;
        case "DONE":
            DONE.append(oldTask)
            break;
        case "IMPEDIMENTS":
            IMPEDIMENTS.append(oldTask)
            break;
    }
});

socket.on('yourProjects', data => {
    $('.yourProjects').empty();
    for (let i in data) {
        let obj = data[i];
        prependThisProject(obj);
        $('#' + obj.id).on('click', () => {
            let page = window.location.href.split('/');
            page = page[page.length - 2];

            if (page == "dashboard") {
                let project = $('#' + obj.id);
                socket.emit('needTasks', obj.id);
                $('.currentProject').removeClass('currentProject');
                project.addClass('currentProject');
                history.pushState('', obj.name, '/dashboard/' + obj.id);
            } else {
                window.location.href = "/dashboard/" + obj.id;
            }

        });
    }
});

socket.on('updateProject', data => {
    let allProjects = $('.yourProjects').children();
    for (let i in data) {
        let notes = $('#' + data[i].id + " span");
        if (notes != data[i].notes) {
            notes.html(data[i].notes);
        }
    }
});

//Functions
function addTask() {
    let data = {};
    data.projectID = $(".currentProject").attr("id");
    data.name = $('#taskNameInput').val();
    data.description = $('#taskDescriptionInput').val();
    $('#taskDescriptionInput').val('');
    $('#taskNameInput').val('');
    if (isEditing)
        socket.emit('editTask', data);
    else
        socket.emit('newTask', data);
}

function move(element, taskID) {
    socket.emit('moveTask', {
        state: element,
        id: taskID,
        projectID: $(".currentProject").attr("id")
    });
}
async function addProject(name, desc) {
    socket.emit("addProject", { name, desc });
}
function addComment() {
    let data = {
        content: $("#Comment").val(),
        taskID: $(".currentTask").attr("id"),
        projectID: $(".currentProject").attr("id")
    }
    $("#Comment").val("");
    socket.emit("addComment", data)

}
function addUser(username) {
    let data = {
        users: username.split(","),
        projectID: $(".currentProject").attr("id")
    }
    socket.emit("addUser", data)
}

function prependThisProject(obj) {
    let projects = $('.yourProjects');
    let id = window.location.href.split('/');
    id = id[id.length - 1];
    let displayName = obj.name.substring(0, 2).toUpperCase();
    projects.append(` <div class="project" id="${obj.id}" class="btn btn-secondary" data-toggle="tooltip" data-placement="right"
                title="${obj.name}">
                <p>${obj.name.substring(0, 2).toUpperCase()}</p>
                <span class="badge notes">${obj.notes}</span >
            </div > `)
    $('#' + obj.id).tooltip({ boundary: 'window' });
    if (obj.id == id) {
        $('#' + obj.id).addClass('currentProject');
    }
}
function scrollAllWayDown(elementID) {
    let chatHistory = document.getElementById(elementID);
    if (chatHistory != null)
        chatHistory.scrollTop = chatHistory.scrollHeight;
}
function acceptProjectInvite(inviteID) {
    socket.emit("acceptProjectInvite", inviteID);
}
function declineProjectInvite(inviteID) {
    socket.emit("declineProjectInvite", inviteID);
}