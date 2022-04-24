function register() {
    var name = $("#name").val();
    var password = $("#password").val();
    var cpassword = $("#cpassword").val();
    if (cpassword === password) {
        $.post(
            "/api/register",
            {
                name: name,
                password: password
            },
            function (data, status) {
                if (status == "success") {
                    if (data.response == true) {
                        //login success
                        alert("success");
                        window.location.replace("/");
                    }
                    else {
                        //login error
                        alert("fail");
                    }
                }
            }
        );
    }
}

function login() {
    var name = $("#name").val();
    var password = $("#password").val();
    $.post(
        "/api/login",
        {
            name: name,
            password: password
        },
        function (data, status) {
            if (status == "success") {
                if (data.response == true) {
                    //login success
                    alert("success");
                    window.location.replace("/");
                }
                else {
                    //login error
                    alert("fail");
                }
            }
        }
    );
}

function enable_register_login(fun)
{
    $("#submit").click(fun);
    $("body").keydown(function (event) {
        if (event.key == "Enter") {
            fun();
        }
    });
}