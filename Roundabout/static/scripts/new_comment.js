var creating_comment = false;
function new_comment(post_id) {
    if (!creating_comment) {
        creating_comment = true;
        text = $("#create-comment-input").val()
        $.post(
            "/api/new-comment",
            {
                p: post_id,
                text: text
            },
            function (data, status) {
                if (status == "success") {
                    $("#comments").html(gen_comment(data.comment) + $("#comments").html());
                    $("#comments .comment:first-child").addClass("created");
                    $("#create-comment-input").val("");
                }
                creating_comment = false;
            });
    }
}