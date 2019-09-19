var socket = io();



//Cards
let BACKLOG = $('#BACKLOG');
let TODO = $('#TODO');
let INPROGRESS = $('#INPROGRESS');
let TOVERIFY = $('#TOVERIFY');
let DONE = $('#DONE');
let IMPEDIMENTS = $('#IMPEDIMENTS');


$(document).ready(() => {
    socket.emit('needTasks');
    addEventListners();
});


isEditing = false;
//Eventlistners
$('#submitTask').on('click', addTask);

//ReviceEvent
socket.on('allTasks', (data) => {
    console.log(data);
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
        $(element).append(`<li id="${obj.id}" draggable="true" ondragstart="drag(event)" class="list-group-item taskItem">${obj.name}<p class="hidden">${obj.description}</p></li>`);

    }
    //    <li id="asdd" draggable="true" ondragstart="drag(event)" class="list-group-item taskItem">Taskname</li>
});

//Functions
function addTask() {
    let data = {};
    data.projectID = "bw15v0bkZ7daDz7d5HtAOix0o0OY1lW7";
    data.name = $('#taskNameInput').val();
    data.description = $('#taskDescriptionInput').val();
    if (isEditing)
        socket.emit('editTask', data);
    else
        socket.emit('newTask', data);
}