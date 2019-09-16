//gör att sidan förstår hur den ska behandla "koden" nedanför
function addEventListners() {
    var basicInfo = [...document.getElementsByClassName('item')];
    var moreInfo = [...document.getElementsByClassName('moreInfo')];
    var delBtn = [...document.getElementsByClassName('delete')];
    var editBtn = [...document.getElementsByClassName('edit')];
    for (let i = 0; i < basicInfo.length; i++) {
        delBtn[i].addEventListener('click', function(){
            socket.emit('delTask', delBtn[i].getAttribute('name'));
            setTimeout(function(){
                socket.emit('getTasks');
            },250);
        });
    }

    for (let i = 0; i < basicInfo.length; i++) {
        editBtn[i].addEventListener('click', function(){
            showTaskEdit(editBtn[i].getAttribute('name'))
        });
    }
    


//gör att rad "2" visas när vi hoverar rad "1"
    for (let i = 0; i < basicInfo.length; i++) {
        basicInfo[i].addEventListener('mouseenter', function () {
            moreInfo[i].style.display = "table-row";
            basicInfo[i].classList.add("grey");
        });
//gör att när vi går ut ut första och andra raden så försvinner rad "2"
        basicInfo[i].addEventListener('mouseleave', function () {
            moreInfo[i].style.display = "none";
            basicInfo[i].classList.remove("grey");
        });
    }
}

//säger till sidan att "leta" efter ny information, så att den kan sätta in den nya informationen utan att behöva refresha sidan
$(document).ready(function () {
    addEventListners();
});

$('.table').bind("DOMSubtreeModified", addEventListners);


