function is_on_profile() {
    return ("u/"+$("#username-tag").text() == $("#location").text());
}

function is_on_home() {
    return ("Home" == $("#location").text());
}