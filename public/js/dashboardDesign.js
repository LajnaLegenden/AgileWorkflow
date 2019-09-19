
$('.card').hover(
    function () {
        $(this).css("overflow", "auto")
    }, function () {
        $(this).css("overflow", "hidden")
    }
);
function addEventListners() {
    let tasks = [...document.getElementsByClassName('taskItem')];
    for (let i in tasks) {
        console.log(tasks[i])
        tasks[i].addEventListener('mouseenter', () => {
            let id = $(tasks[i]).attr('id');
            $('#' + id + "p").removeClass('hidden');
        });
        tasks[i].addEventListener('mouseleave', () => {
            let id = $(tasks[i]).attr('id');
            $('#' + id + "p").addClass('hidden');
        });
    }
}


$('.taskItem').on('mouseenter',
    function () {
        console.log("asda");
        let id = $(this).attr('id');
        $(id + "p").removeClass('hidden');
    }).on('mouseleave', function () {
        let id = $(this).attr('id');
        $(id + "p").addClass('hidden');
    }
    );


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    console.log(ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    let element = ev.srcElement;
    if ($(element).is('li')) {
        element = $(element).parent();
    }
    console.log(ev)
    var data = ev.dataTransfer.getData("text");
    element.append(document.getElementById(data));
}

