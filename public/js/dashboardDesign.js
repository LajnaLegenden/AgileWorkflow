
$('.card').hover(
    function () {
        $(this).css("overflow", "auto")
    }, function () {
        $(this).css("overflow", "hidden")
    }
);
let projectId = window.location.href.split("/");
projectId = projectId[projectId.length -1];
console.log(projectId)
$("#" + projectId).addClass("currentProject")
function addEventListners() {
    let tasks = [...document.getElementsByClassName('taskItem')];
    for (let i in tasks) {
        tasks[i].addEventListener('mouseenter', () => {
            let id = $(tasks[i]).attr('id');
            $('#' + id + " p").removeClass('hidden');

        });
        tasks[i].addEventListener('mouseleave', () => {
            let id = $(tasks[i]).attr('id');
            $('#' + id + " p").addClass('hidden');
        });

        tasks[i].addEventListener('click', () => {
            let id = $(tasks[i]).attr('id');
            socket.emit('moreInfo', id);
        });
    }
}


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    let doStuff = true;
    let element = ev.srcElement;
    if ($(element).is('li')) {
        element = $(element).parent();
    }
    if ($(element).is('p')) {
        doStuff = false;
    }

    element = $(element);
    if (doStuff) {
        var data = ev.dataTransfer.getData("text");
        let dropped = document.getElementById(data);
        element.append(dropped);
        move(element.attr('id'), dropped.id)
    }


}

