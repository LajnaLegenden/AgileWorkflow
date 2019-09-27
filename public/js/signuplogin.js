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
    var passw=  /^[A-Za-z]\w{7,14}$/;
    if (url == "/signup" && data.user.password != data.user.password2 || url == "/signup" && data.user.password.length <= 6 || url =="/signup" && !data.user.password.match(passw)) {
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
            let returnUrl = urlParams.get('returnUrl');
            if (!returnUrl) {
                returnUrl = "/"
            }
            document.location.href = returnUrl;

        }
        setTimeout(() => {
            alert.removeClass("hide");
            alert.html(res);
        }, 1000);
        setTimeout(() => {
            alert.addClass("hide");
        }, 6000);
    });
});
