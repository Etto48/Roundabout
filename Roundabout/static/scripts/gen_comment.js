function gen_comment(comment)
{
    var comment_data = {
        id: comment[0],
        post_id: comment[1],
        text: comment[2],
        created: comment[3],
        user_name: comment[4],
    }

    var template = 
    "<article class=\"comment\" id=\"comment{{ id }}\">"+
        "<canvas height=\"100px\" width=\"100px\" class=\"usericon\" id=\"icon{{ id }}\"></canvas>"+
        "<small class=\"author\">{{ user_name }}</small>"+
        "<small class=\"date\">{{ created }}</small>"+
        "<p>{{ text }}</p>"+
        "<div class=\"comment-border\"></div>"+
    "</article>"+
    "<script>draw_icon(\"{{ user_name }}\",\"icon{{ id }}\");</script>";
    return Mustache.render(template,comment_data);

}