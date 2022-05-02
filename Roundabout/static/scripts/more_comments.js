var from = 0;
var count = 10;
var end = false;
var loading = false;
var request = {};

function set_comment_request(key, val) {
    request[key] = val
}

function more_comments() {
    if (!loading) {
        loading = true;
        if (!end) {
            request['from'] = from;
            request['count'] = count;
            $.getJSON(
                "/api/comments",
                request,
                function (data, status) {
                    if (status == "success") {
                        from += data.length;
                        data.forEach(function (comment) {
                            $("#comments").html($("#comments").html() + gen_comment(comment));
                        });
                        if (data.length < count) {
                            if (from == 0 && data.length == 0)
                                $("#comments").html($("#comments").html() + "<p id=\"no-comments\">No one commented yet, be the first!</p>");
                            $("#end").hide();
                            end = true;
                        }
                    }
                    loading = false;
                }
            );
        }
    }
}

function check_screen_and_update_comments() {
    var threshold = 160;
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - threshold) {
        more_comments();
    }
}

function start_loading_comments(key, val) {
    set_comment_request(key, val)
    more_comments();
    window.addEventListener("scroll",check_screen_and_update_comments);
    window.addEventListener("resize",check_screen_and_update_comments);
}