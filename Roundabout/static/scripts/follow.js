var follow_working = false;

function follow_unfollow(user_name,button_id) {
    if(!follow_working)
    {
        follow_working = true;
        var sr;
        var button = $("#"+button_id);
        var btext = button.text();
        if(btext=="Unfollow")
        {
            sr = 'r';
        }
        else if(btext=="Follow")
        {
            sr = 's'
        }
        else {
            follow_working = false;
            return;
        }
        button.addClass("loading");
        $.post(
            "/api/follow",
            {
                target: user_name,
                sr: sr
            },
            function(data,status) {
                if (status == "success") {
                    if(data.response) {
                        var followers_count = $("#followers-count");
                        var followed_count = $("#followed-count");
                        var follow_delta = 0;
                        if(sr=='s') {
                            button.text("Unfollow");
                            button.addClass("unfollow");
                            follow_delta = 1;
                        }
                        else {
                            button.text("Follow");
                            button.removeClass("unfollow");
                            follow_delta = -1;
                        }
                        button.removeClass("loading");
                        if(is_on_user(user_name))
                        {
                            followers_count.text(parseInt(followers_count.text())+follow_delta);
                        }
                        else if(is_on_profile())
                        {
                            followed_count.text(parseInt(followed_count.text())+follow_delta);
                        }
                    }
                }
                follow_working = false;
            }
        );
    }
}