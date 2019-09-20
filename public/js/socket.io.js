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
    socket.emit('needTasks');
});


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
    addEventListners();
    function addToBoard(obj, element) {
        $(element).append(`<li id="${obj.id}" draggable="true" ondragstart="drag(event)" class="list-group-item taskItem border">${obj.name}<p  draggable="false" class="hidden desc">${obj.description}</p></li>`);
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

socket.on('goUpdate', () => {
    socket.emit('needTasks');;
});

socket.on('infoAboutTask', (data) => {
    let name = $('#infoName').html("Name: " + data[0].name);
    let desc = $('#infoDesc').html("Description: " + data[0].description);
    let state = $('#infoState').html("State: " + data[0].state);
    let postdate = $('#infoPostdate').html("Date: " + data[0].postDate);
    let pID = $('#infoProjectId').html("Project ID " + data[0].projectID);
});

//Functions
function addTask() {
    let data = {};
    data.projectID = "bw15v0bkZ7daDz7d5HtAOix0o0OY1lW7";
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
        id: taskID
    });

}