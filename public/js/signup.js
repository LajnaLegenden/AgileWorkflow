let inputs = [...document.querySelectorAll('input')];
let btn = $('#submit');


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
        url: "/signup",
        data: data
      });
});