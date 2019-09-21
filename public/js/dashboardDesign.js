
$('.card').hover(
    function () {
        $(this).css("overflow", "auto")
    }, function () {
        $(this).css("overflow", "hidden")
    }
);
let projectId = window.location.href.split("/");
projectId = projectId[projectId.length - 1];
console.log(projectId)
$("#" + projectId).addClass("currentProject")


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    let doStuff = true;
    let element = $(ev.srcElement);
    if (element.is('li')) {
        element = $(element).parent();
    }
    if (element.is('p')) {
        doStuff = false;
    }


    var data = ev.dataTransfer.getData("text")
    let dropped = document.getElementById(data);


    let from = $(dropped).parent().attr('id');
    let to = element.attr('id');


    if (from == to) {
        doStuff = false;
    }


    if (doStuff) {
        element.append(dropped);
        move(element.attr('id'), dropped.id)
    }


}
$("#showForm").click(() => {
    $("#form").removeClass("hide")
    $("#taskDesc").addClass("hide")
    $("#comments").addClass("hide")
});

