let inputs = [...document.querySelectorAll('input')];
let btn = $('#submit');
let alert = $('#alert');


let url = window.location.href;
let urlArr = url.split('/');
url = '/' + urlArr[urlArr.length-1];

btn.on('click', () => {
    let data = {
        user: {

        }
    };
    for (let i in inputs) {
        let currentVal = inputs[i].value;
        data.user[inputs[i].id] = currentVal;
        //Check pass
    }
    $.ajax({
        type: "POST",
        url: url,
        data: data
      }).done((res) => {
          if()
         alert.show();
         alert.html(res);
         setTimeout(() => {
             alert.hide();
         }, 10000);
      });
});