function gen_post(post)
{
    var post_data = {
        id: post[0],
        user_name: post[1],
        text: post[2],
        created: post[3],
        likes: post[4],
        comments: post[5],
        liked: post[6]
    }

    var template = 
    "<article class=\"post\" id=\"post{{ id }}\">"+
        "<canvas height=\"100px\" width=\"100px\" class=\"usericon\" id=\"icon{{ id }}\"></canvas>"+
        "<small class=\"author\">{{ user_name }}</small>"+
        "<small class=\"date\">{{ created }}</small>"+
        "<p>{{ text }}</p>"+
        "<div class=\"post-bar\">"+
            "<div class=\"like {{#liked}}liked{{/liked}}\" onclick=\"sr_like({{ id }})\"><i class=\"fa-solid fa-heart\"></i><small class=\"like-count\">{{ likes }}</small></div>"+
            "<div class=\"comment\"><i class=\"fa-solid fa-message\"></i><small class=\"comment-count\">{{ comments }}</small></div>"+
            "<div class=\"share\"><i class=\"fa-solid fa-share-nodes\"></i></div>"+
        "</div>"+
    "</article>"+
    "<script>draw_icon(\"{{ user_name }}\",\"icon{{ id }}\");</script>";
    return Mustache.render(template,post_data);

}