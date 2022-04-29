var from = 0;
var count = 10;
var end = false;
var loading = false;
var request = {};

function set_post_request(key, val) {
    request[key] = val
}

function more_posts() {
    if (!loading) {
        loading = true;
        if (!end) {
            request['from'] = from;
            request['count'] = count;
            $.getJSON(
                "/api/posts",
                request,
                function (data, status) {
                    if (status == "success") {
                        from += data.length;
                        data.forEach(function (post) {
                            $("#posts").html($("#posts").html() + gen_post(post));
                        });
                        if (data.length < count) {
                            if (from == 0 && data.length == 0)
                                $("#posts").html($("#posts").html() + "<p>Nothing to see here</p>");
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

function check_screen_and_update_posts() {
    var threshold = 160;
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - threshold) {
        more_posts();
    }
}

function start_loading_posts(key, val) {
    set_post_request(key, val)
    more_posts();
    window.addEventListener("scroll",check_screen_and_update_posts);
    window.addEventListener("resize",check_screen_and_update_posts);
}