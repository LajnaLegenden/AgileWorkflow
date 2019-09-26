
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
function pressEnterToSubmit(inputElementID, submitBtnID){
  $("#" + inputElementID).on('keypress',function(e) {
    console.log("pressed", e)
    if(e.code == "Enter") {
        $(submitBtnID).trigger("click");
    }
});
}
pressEnterToSubmit("Message", "addMessage");

