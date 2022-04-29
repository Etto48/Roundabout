function new_comment(post_id) {
    text = $("#create-comment-input").val()
    $.post(
        "/api/new-comment",
        {
            p: post_id,
            text: text
        },
        function(data,status)
        {
            if(status=="success")
            {
                $("#comments").html(gen_comment(data.comment) + $("#comments").html());
                $("#create-comment-input").val("");
            }
        });
}