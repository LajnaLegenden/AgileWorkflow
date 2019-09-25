let inputs = [...document.querySelectorAll('input')];
let btn = $('#ssubmit');
let alert = $('#alert');

function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
let url = window.location.href;
let urlArr = url.split('?');
url = urlArr[0];
url = url.split('/');
url = '/' + url[url.length - 1];

if (performance.navigation.type == 2) {
    location.reload(true);
}

btn.on('click', () => {
    let data = {
        user: {

        }
    };
    let fail = false;
    for (let i in inputs) {
        let currentVal = inputs[i].value;
        if (currentVal == "") {
            inputs[i].classList.add("missing-info");
            fail = true;
        } else {
            inputs[i].classList.remove("missing-info");
        }
        data.user[inputs[i].id] = currentVal;
        //Check pass
    }
    if (url == "/signup" && data.user.password != data.user.password2) {
        fail = true;
        inputs[inputs.length - 1].classList.add("missing-info");
        inputs[inputs.length - 2].classList.add("missing-info");
    }
    if (url == "/signup" && !validateEmail(inputs[2].value)) {
        fail = true;
        inputs[2].classList.add("missing-info");
    }
    if (fail) return;
    $.ajax({
        type: "POST",
        url: url,
        data: data
    }).done((res) => {
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
