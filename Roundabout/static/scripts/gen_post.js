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
    };

    var text = post[2];

    var md = new remarkable.Remarkable();
    var text_render = md.render(text);

    var template = 
    "<article class=\"post\" id=\"post{{ id }}\" onclick=\"window.location.assign('/p/{{ id }}')\">"+
        "<canvas height=\"100px\" width=\"100px\" class=\"usericon\" id=\"icon{{ id }}\"></canvas>"+
        "<small class=\"author\">{{ user_name }}</small>"+
        "<small class=\"date\">{{ created }}</small>"+
        "<div class=\"post-text\">"+
        text_render+
        "</div>"+
        "<div class=\"post-bar\">"+
            "<div class=\"like {{#liked}}liked{{/liked}}\" onclick=\"sr_like({{ id }})\"><i class=\"fa-solid fa-heart\"></i><small class=\"like-count\">{{ likes }}</small></div>"+
            "<div class=\"comment\"><i class=\"fa-solid fa-message\"></i><small class=\"comment-count\">{{ comments }}</small></div>"+
            "<div class=\"share\" onclick=\"share('Post from {{ user_name }}','https://ircpi.ddns.net/p/{{ id }}')\"><i class=\"fa-solid fa-share-nodes\"></i></div>"+
        "</div>"+
    "</article>"+
    "<script>draw_icon(\"{{ user_name }}\",\"icon{{ id }}\");</script>"+
    "<script>"+
    "$(\"#post{{ id }} .like\").on(\"click\",function(event){event.stopPropagation();});"+
    "$(\"#post{{ id }} .share\").on(\"click\",function(event){event.stopPropagation();});"+
    "</script>";
    return Mustache.render(template,post_data);

}