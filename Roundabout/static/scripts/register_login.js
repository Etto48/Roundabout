var waiting = false;

function start_waiting_animation() {
    $("#submit").addClass("waiting");
}

function end_waiting_animation() {
    $("#submit").removeClass("waiting");
}

function register() {
    var name = $("#name").val();
    var password = $("#password").val();
    var cpassword = $("#cpassword").val();
    if (cpassword === password) {
        if(!waiting)
        {
            waiting = true;
            start_waiting_animation();
        $.post(
            "/api/register",
            {
                name: name,
                password: password
            },
            function (data, status) {
                if (status == "success") {
                    if (data.response == true) {
                        //register success
                        window.location.replace("/");
                    }
                    else {
                        //register error
                        end_waiting_animation();
                        waiting = false;
                    }
                }
                else {
                    end_waiting_animation();
                    waiting = false;
                }
            }
        );
        }
    }
}

function login() {
    var name = $("#name").val();
    var password = $("#password").val();
    if(!waiting)
    {
        waiting=true;
        start_waiting_animation();
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
                    window.location.replace("/");
                }
                else {
                    //login error
                    end_waiting_animation();
                    waiting=false;
                }
            }
            else 
            {
                end_waiting_animation();
                waiting=false;
            }
        }
    );
    }
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