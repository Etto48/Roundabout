function sr_like(post_id)
{
    var sr = 's';
    if($("#post"+post_id+" .like").hasClass("liked"))
    {
        sr = 'r';
    }
    var like_counter = $("#post"+post_id+" .like .like-count");
    var count = parseInt(like_counter.text(),10);
    $.post(
        "/api/like",
        {
            post_id: post_id,
            sr: sr
        },
        function(data,status)
        {
            var good = false;
            if(status=="success"){
                if(data.response==true)
                {
                    good = true;
                }
            }
            if(!good)
            { // rollback the edit
                $("#post"+post_id+" .like").toggleClass("liked");
                like_counter.text(count);
            }
        });
        if(sr=='s')
        {
            $("#post"+post_id+" .like").addClass("liked");
            like_counter.text(count+1);
        }
        else if(sr=='r')
        {
            $("#post"+post_id+" .like").removeClass("liked");
            like_counter.text(count-1);
        }
}