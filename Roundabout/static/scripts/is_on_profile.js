function is_on_profile()
{
    var ret = ("u/"+$("#username-tag").text() == $("#location").text());
    console.log("On profile: "+ret);
    return ret;
}