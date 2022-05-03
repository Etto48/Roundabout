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
        
        $.post(
            "/api/follow",
            {
                target: user_name,
                sr: sr
            },
            function(data,status) {
                if (status == "success") {
                    if(data.response) {
                        if(sr=='s') {
                            button.text("Unfollow");
                        }
                        else {
                            button.text("Follow");
                        }
                    }
                }
                follow_working = false;
            }
        );
    }
}