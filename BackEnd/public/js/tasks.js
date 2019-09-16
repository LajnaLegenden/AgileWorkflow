var socket = io();

socket.on('updateUsers', function (onlineUsers) {
  var users = document.getElementById("users");
  users.innerHTML = "Online Users: " + onlineUsers;
});

var submitbtn = document.getElementById("submit");
submitbtn.addEventListener("click", function (e) {
  e.preventDefault();
  var d = new Date();
  var task = {};
  task.name = document.getElementById("name").value;
  task.priority = document.getElementById("priority").value;
  task.status = document.getElementById("status").value;
  task.time = document.getElementById("time").value;
  task.description = document.getElementById("description").value;
  socket.emit('newTask', task);
});

socket.on('tasks', function (tasks) {
  var table = document.getElementById("taskView");
  var head = '<thead><tr><th scope="col">Number</th><th scope="col">Name</th><th scope="col">Due Date</th><th scope="col">Status</th></tr></thead>';

  table.innerHTML = head;
  for (let i = 0; i < tasks.total_rows; i++) {
    let row = tasks.rows[i].doc;
    let time = row.time.split("T");
    table.innerHTML += `<tbody class="item" id="1">
        <tr>
          <td scope="row">${i + 1}</td>
          <td>${row.name}</td>
          <td>${time[0] + " " + time[1]}</td>
          <td>${row.status}</td>
        </tr>
        <tr class="moreInfo grey" id="1">
        <td>&nbsp;</td>
          <td scope="row">${row.description}</td>
          <td>&nbsp;</td>
          <td><i class="fas fa-pen icon edit" name="${row.name}">&nbsp;</i><i class="fas icon fa-trash delete" name="${row.name}"></i></td>
        </tr>
      </tbody>`
  }

});


socket.on('allGood', function () {
  $('#myModal').modal('hide');
  $('#myEditModal').modal('hide');
  socket.emit('getTasks');
});

function showTaskEdit(name) {
  socket.emit('getForEdit', name);
}

socket.on('editThis', function (doc) {
  $('#myEditModal').modal('show');
  $('#Ename').html(doc.name);
  $('#Epriority').val(doc.priority);
  $('#Estatus').val(doc.status);
  $('#Etime').val(doc.time);
  $('#Edescription').val(doc.description);
  $('#submitEdit').on('click', function (e) {
    e.preventDefault();

    var newTask = {};

    newTask.name = $('#Ename').text();
    newTask.priority = $('#Epriority').val();
    newTask.status = $('#Estatus').val();
    newTask.time = $('#Etime').val();
    newTask.description = $('#Edescription').val();

    socket.emit('updateTask', newTask);

  });
});




$(document).ready(function () {
  socket.emit('getTasks');
  socket.emit("needUserUpdate");
});

