let taskView = $('#taskView');
let spacer = $('.spacer');
let tasks = $('.taskItem');

// tasks.each(function (index) {
//     tasks[index].on(() => {
//         (this).addClass('itemHover');
//         spacer.addClass('spacerSmall');
//     }, () => {
//         (this).removeClass('itemHover');
//         spacer.removeClass('spacerSmall');
//     });
// });

$('.card').hover(
    function () {
        $(this).css("overflow", "auto")
    }, function () {
        $(this).css("overflow", "hidden")
    }
);


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    console.log(ev);
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}