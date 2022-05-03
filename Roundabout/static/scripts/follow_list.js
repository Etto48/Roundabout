var loading_follow = false;
function load_followers(name) {
    if (!loading_follow) {
        loading_follow = true;
        $.getJSON(
            "/api/followers",
            {
                u: name
            },
            function (data, status) {
                if (status == "success") {
                    $("#follow-list").html("");
                    data.forEach(
                        function (follow) {
                            $("#follow-list").html($("#follow-list").html() + gen_follow(follow));
                        }
                    );
                    if(data.length==0)
                    {
                        $("#follow-list").html("<p class=\"no-follow\" id=\"no-followers\">No one to show</p>");
                    }
                    $("#follow-list-wrapper h1").text("Followers");
                    $("#follow-list-container").addClass("show");
                }
                loading_follow = false;
            }
        );
    }
}

function load_followed(name) {
    if (!loading_follow) {
        loading_follow = true;
        $.getJSON(
            "/api/followed",
            {
                u: name
            },
            function (data, status) {
                if (status == "success") {
                    $("#follow-list").html("");
                    data.forEach(
                        function (follow) {
                            $("#follow-list").html($("#follow-list").html() + gen_follow(follow));
                        }
                    )
                    if(data.length==0)
                    {
                        $("#follow-list").html("<p class=\"no-follow\" id=\"no-followed\">No one to show</p>");
                    }
                    $("#follow-list-wrapper h1").text("Following");
                    $("#follow-list-container").addClass("show");
                }
                loading_follow = false;
            }
        );
    }
}

function hide_follow() {
    $("#follow-list-container").removeClass("show");
    $("#follow-list").html("");
}

function enable_follow() {
    window.addEventListener("keydown", function (event) {
        if (event.key == "Escape") {
            hide_follow();
        }
    });
    $("#follow-list-container").click(function(event) {
        if (!$("#follow-list").is(event.target) && $("#follow-list").has(event.target).length === 0 || $("#follow-title i").is(event.target)) {
            hide_follow();
        }
    });
}