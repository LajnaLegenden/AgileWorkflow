var socket = io();

document.onload(() => {
    socket.emit('needTasks');
})
isEditing = false;
//Eventlistners
$('#submitTask').on('click', addTask);

//ReviceEvent
socket.on('updateTasks', (data) => {

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