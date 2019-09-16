var socket = io();

function addTask(){
    let data = {};

    data.name = $('taskNameInput').val();
    data.description = $('taskDescriptionInput').val();
    console.log(data);
}