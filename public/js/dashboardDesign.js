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

$('.taskItem').hover(
    function () {
        spacer.css("height", "1em");
    }, function () {
        spacer.css("height", "3em");

    }
);