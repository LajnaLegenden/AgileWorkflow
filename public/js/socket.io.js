var socket = io();

//Cards
let BACKLOG = $('#BACKLOG');
let TODO = $('#TODO');
let INPROGRESS = $('#INPROGRESS');
let TOVERIFY = $('#TOVERIFY');
let DONE = $('#DONE');
let IMPEDIMENTS = $('#IMPEDIMENTS');
//He
$(document).ready(() => {
    let projectID = $(".currentProject").attr("id")
    socket.emit('needTasks', projectID);
});

function addNewEventListeners(newTask){
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
        $("#form").addClass("hide")
        $("#taskDesc").removeClass("hide")
        $("#comments").removeClass("hide")
    });
}
isEditing = false;
//Eventlistners
$('#submitTask').on('click', addTask);



//ReviceEvent
socket.on('allTasks', (data) => {
    //Empty
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
    function addToBoard(obj, element) {
        $(element).append(`<li id="${obj.id}" draggable="true" ondragstart="drag(event)" class="list-group-item taskItem border">${obj.name}<p  draggable="false" class="hidden desc">${obj.description}</p></li>`);
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
    socket.emit('needTasks', projectID);;
});

socket.on('infoAboutTask', (data) => {
    let name = $('#infoName').html("Name: " + data[0].name);
    let desc = $('#infoDesc').html("Description: " + data[0].description);
    let state = $('#infoState').html("State: " + data[0].state);
    let postdate = $('#infoPostdate').html("Date: " + data[0].postDate);
    let pID = $('#infoProjectId').html("Project ID " + data[0].projectID);
});
socket.on("updateProjects", data => {
    socket.emit()
});
socket.on('log', async (data) => {
    
    let element = data;
    $('#log').append(element);
    let chatHistory = document.getElementById("log");
    chatHistory.scrollTop = chatHistory.scrollHeight;
});

socket.on('allGood', function () {
    $('#myModal').modal('hide');
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
        projectID:$(".currentProject").attr("id")
    });
}
async function addProject(name, desc) {
    socket.emit("addProject", { name, desc });
}