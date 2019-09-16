var socket = io();

isEditing = false;
//Eventlistners
$('#submitTask').on('click', addTask);

//ReviceEvent


//Functions
function addTask(){
    let data = {};
    data.projectID = "bw15v0bkZ7daDz7d5HtAOix0o0OY1lW7";
    data.name = $('#taskNameInput').val();
    data.description = $('#taskDescriptionInput').val();
    if(isEditing)
        socket.emit('editTask', data);
    else
    socket.emit('newTask', data);
}