let inputs = [...document.querySelectorAll('input')];
let btn = $('#submit');
let alert = $('#alert');


let url = window.location.href;
let urlArr = url.split('?');
url = urlArr[0];
url = url.split('/');
url = '/' + url[url.length - 1];

btn.on('click', () => {
    let data = {
        user: {

        }
    };
    let fail = false;
    for (let i in inputs) {
        let currentVal = inputs[i].value;
        if(currentVal == "") {
            inputs[i].classList.add("error");
            fail = true;
        } else{
            inputs[i].classList.remove("error");
        }
        data.user[inputs[i].id] = currentVal;
        //Check pass
    }
    if(fail) return;
    $.ajax({
        type: "POST",
        url: url,
        data: data
    }).done((res) => {
        console.log(res + "asd");
        if (res.includes("<head>")) {
            var urlParams = new URLSearchParams(window.location.search);
            let asd = urlParams.get('returnUrl');
            if (!asd) {
                asd = "/"
            }
            document.location.href = asd;

        }
        alert.show();
        alert.html(res);
        setTimeout(() => {
            alert.hide();
        }, 10000);
    });
});
