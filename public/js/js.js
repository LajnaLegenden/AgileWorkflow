
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
  $('.project').tooltip({ boundary: 'window' })
  $(".project").click(function() {
      let id = $(this).attr("id");
      location.href = "/dashboard/" + id;
  })