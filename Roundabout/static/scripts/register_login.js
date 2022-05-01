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
                        //TODO: handle registration fail
                        var ndiv = $("#name-container");
                        var pdiv = $("#pwd-container");
                        var cdiv = $("#cpwd-container");

                        if(data.why=='nregex')
                        {
                            console.log('Username does not respect the regex');
                            ndiv.addClass("wrong");
                            $("#error-text").text("Username must be at least 4 characters, at most 16 and contain only letters, numbers or \"-\" and \"_\"");
                        }
                        else if(data.why=='pregex')
                        {
                            console.log('Password does not respect the regex');
                            pdiv.addClass("wrong");
                            $("#error-text").text("Password must be at least 8 characters, and must contain at least one letter and one number");
                        }
                        else if(data.why=='npresent')
                        {
                            console.log('Username already in use');
                            ndiv.addClass("wrong");
                            $("#error-text").text("Username is already in use");
                        }
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
    else 
    {
        $("#cpwd-container").addClass("wrong");
        $("#error-text").text("The two passwords must match");
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
                    //TODO: handle registration fail
                    $("#error-text").text("Wrong username or password");
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
    

function register_name_check() {
    var name = $("#name").val();
    var ndiv = $("#name-container");
    if(!name.match(/^[a-zA-Z0-9_-]{4,16}$/))
    {
        ndiv.addClass("wrong");
        //$("#error-text").text("Username must be at least 4 characters, at most 16 and contain only letters, numbers or \"-\" and \"_\"");
    }
    else 
    {
        ndiv.removeClass("wrong");
        //$("#error-text").text("");
    }
}

function register_password_check() {
    var grade = grade_password($("#password").val());
    var bar = $("#pwd-strenght")
    var div = $("#pwd-container");
    var cdiv = $("#cpwd-container");
    var pwd = $("#password").val();
    var cpwd = $("#cpassword").val();
    var bar_cont = $("#pwd-strenght-bg");

    var good = true;
    if(pwd != cpwd && cpwd != "") {
        cdiv.addClass("wrong");
        //$("#error-text").text("The two passwords must match");
        good = false
    }
    else 
    {
        cdiv.removeClass("wrong");
    }

    if(grade == -1)
    {
        bar.width("0%");
        bar.css("background-color","red");
        div.addClass("wrong");
        //$("#error-text").text("Password must be at least 8 characters, and must contain at least one letter and one number");
        good = false;
    }
    else if(grade == 0)
    {
        bar.width("10%");
        bar.css("background-color","red");
        div.addClass("wrong");
        //$("#error-text").text("Password must be at least 8 characters, and must contain at least one letter and one number");
        good = false;
    }
    else if(grade == 1)
    {
        bar.width("40%");
        bar.css("background-color","orange");
        div.removeClass("wrong");
    }
    else if(grade == 2)
    {
        bar.width("70%");
        bar.css("background-color","green");
        div.removeClass("wrong");
    }
    else if(grade == 3)
    {
        bar.width("100%");
        bar.css("background-color","blue");
        div.removeClass("wrong");
    }

    if(good)
    {
        //$("#error-text").text("");
    }
}

function register_cpassword_check() {
    var pwd = $("#password").val();
    var cpwd = $("#cpassword").val();
    var div = $("#cpwd-container");
    if(pwd != cpwd) {
        div.addClass("wrong");
        //$("#error-text").text("The two passwords must match");
    }
    else 
    {
        div.removeClass("wrong");
        //$("#error-text").text("");
    }
}

function check_login() {
    $("#error-text").text("");
}

function enable_register_login(fun)
{
    if(fun==register)
    {
        $("#name").on("input",register_name_check);
        $("#password").on("input",register_password_check);
        $("#cpassword").on("input",register_cpassword_check);
    }
    else if(fun=login)
    {
        $("#name").on("input",check_login);
        $("#password").on("input",check_login);
    }
    $("#submit").click(fun);
    $("body").keydown(function (event) {
        if (event.key == "Enter") {
            fun();
        }
    });
}