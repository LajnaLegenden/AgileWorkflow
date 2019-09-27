
$(function () {
  socket.emit('myProjects');
})

$(".project").click(function () {
  let id = $(this).attr("id");
  location.href = "/dashboard/" + id;
})

$("#submit").click(e => {
  e.preventDefault()
  let name = $("#name").val();
  let desc = $("#description").val();
  if (name != "" && desc != "") {
    addProject(name, desc)
  }
});
function pressEnterToSubmit(inputElementID, submitBtnID) {
  $("#" + inputElementID).on('keypress', function (e) {
    if (e.key == "Enter") {
      $("#" + submitBtnID).trigger("click");
    }
  });
}
pressEnterToSubmit("Message", "addMessage");
pressEnterToSubmit("taskNameInput", "submitTask");
pressEnterToSubmit("taskDescriptionInput", "submitTask");
pressEnterToSubmit("name", "submit");
pressEnterToSubmit("Comment", "addComment");
pressEnterToSubmit("username", "ssubmit");
pressEnterToSubmit("password", "ssubmit");

