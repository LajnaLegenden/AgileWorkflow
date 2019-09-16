var socket = io();

isEditing = false;
//Eventlistners
$('#submitTask').on('click', addTask);

//ReviceEvent


//Functions
function addTask(){
    let data = {};
    data.name = $('#taskNameInput').val();
    data.description = $('#taskDescriptionInput').val();
    if(isEditing)
        socket.emit('editTask', data);
    else
    socket.emit('newTask', data);
}