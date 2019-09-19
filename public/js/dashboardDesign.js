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