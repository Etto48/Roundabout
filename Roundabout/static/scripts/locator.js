function is_on_profile() {
    return ("u/"+$("#username-tag").text() == $("#location").text());
}

function is_on_home() {
    return ("Home" == $("#location").text());
}

function is_on_user(user_name) {
    return ("u/"+user_name == $("#location").text());
}

function get_user_name() {
    return $("#username-tag").text();
}