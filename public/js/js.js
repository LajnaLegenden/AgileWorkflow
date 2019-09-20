
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
  $('.project').tooltip({ boundary: 'window' })
  $(".project").click(function()  {
      let id = $(this).attr("id");
      location.href = "/dashboard/" + id;
  })
  $("#submit").click(e => {
    e.preventDefault()
    let name = $("#name").val();
    let desc = $("#description").val();
    if(projectName != "" && projectDesc != ""){
        addProject(name, desc)
    }
    
  });