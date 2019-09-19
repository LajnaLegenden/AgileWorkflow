window.onload = () => {
    let loggedIn = false

    $.ajax({
        type: "GET",
        url: "/isloggedin"
    }).done((res) => {
        if (res == "OK") {
            loggedIn = true;
        } else {
            loggedIn = false;
        }
        console.log(loggedIn);
        if (loggedIn) {
            console.log($('#userControl'))
            $('#userControl').empty();
            $('#userControl').append(`<li class="nav-item">
                        <a class="nav-link active" href="/logout">Log out</a>
                    </li>`);
        }

    });
}