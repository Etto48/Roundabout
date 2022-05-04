function gen_follow(follow) {
    var follow_text = "";
    if(follow[1])
    {
        follow_text = "Unfollow";
    }
    else
    {
        follow_text = "Follow";
    }
    var data = {
        user_name: follow[0],
        unfollow: follow[1],
        follow_text: follow_text
    };

    var follow_button_template = 
        "<div role=\"button\" id=\"follow-{{ user_name }}-button\" class=\"follow-button {{# unfollow }}unfollow{{/ unfollow }}\" onclick=\"follow_unfollow('{{ user_name }}','follow-{{ user_name }}-button')\">{{ follow_text }}</div>"+
        "<script>init_follow_click('follow-{{ user_name }}','follow-{{ user_name }}-button','{{user_name}}')</script>";
    if(get_user_name()==data.user_name)
    {
        follow_button_template = "";
    }

    var template = 
        "<div class=\"follow\" id=\"follow-{{ user_name }}\">"+
            "<canvas width=\"100px\" height=\"100px\" id=\"follow-{{ user_name }}-canvas\"></canvas>"+
            "<p>{{ user_name }}</p>"+
            follow_button_template+
            "<script>draw_icon(\"{{ user_name }}\",\"follow-{{ user_name }}-canvas\")</script>"+
        "</div>";
    return Mustache.render(template,data);
}

function init_follow_click(div_id,button_id,user_name) {
    $("#"+div_id).click(function(event) {
        if(!$("#"+button_id).is(event.target) && $("#"+button_id).has(event.target).length === 0) {
            window.location.assign("/u/"+user_name);
        }
    });
}