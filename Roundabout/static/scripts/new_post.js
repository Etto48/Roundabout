

$("#new-post-container").click(function (event) {
    if (!$("#new-post-overlay").is(event.target) && $("#new-post-overlay").has(event.target).length === 0 || $("#new-post-title i").is(event.target)) {
        hide_new_post_dialog()
    }
});

window.addEventListener("keydown", function (event) {
    if (event.key == "Escape") {
        hide_new_post_dialog()
    }
});

function show_new_post_dialog() {
    $("#new-post-container").addClass("show");
}

function hide_new_post_dialog() {
    $("#new-post-container").removeClass("show");
    $("#new-post-text").val("");
}

var posting = false;
function new_post() {
    if (!posting) {
        posting = true;
        $.post(
            "/api/new-post",
            {
                text: $("#new-post-text").val()
            },
            function (data, status) {
                if(status=="success")
                {
                    //TODO: handle post
                    hide_new_post_dialog();
                    if(is_on_profile() || is_on_home())
                    {
                        $("#posts").html(gen_post(data.post)+$("#posts").html());
                        $("#posts .post:first-child").addClass("created");
                        from += 1;
                    }
                }
                posting = false;
            }
        );
    }
}

$("#create-post").click(new_post);