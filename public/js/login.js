let inputs = [...document.querySelectorAll('input')];
let btn = $('#submit');
let alert = $('#alert');


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
        url: "/login",
        data: data
      }).done((res) => {
         alert.show();
         alert.html(res);

         setTimeout(() => {
             alert.hide();
         }, 10000);
      });
});