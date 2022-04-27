$("#search input").focusin(function (e) {
    if ($("#search input").val() != "") {
        $("#searchres").removeClass("hidden");
    }
});

window.addEventListener("click",function (e) {
    var container = $("#searchres");
    var container2 = $("#search");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.hasClass("hidden")) {
        if (!container.is(e.target) && container.has(e.target).length === 0 && !container2.is(e.target) && container2.has(e.target).length === 0) {
            container.addClass("hidden");
        }
    }
});

var current_res = 0;

var position = -1;
function check_up_down_arrow(event) {
    if (event.key == "ArrowUp" && position > -1) {
        position -= 1;
        if (position > -1) {
            $("#searchlink" + position).addClass("selected");
            $("#searchlink" + (position + 1)).removeClass("selected");
        }
        else {
            $("#searchlink" + 0).removeClass("selected");
            $("#search input").focus();
        }
    }
    else if (event.key == "ArrowDown" && position < current_res - 1) {
        position += 1;
        if (position != 0) {
            $("#searchlink" + (position - 1)).removeClass("selected");
        }
        $("#searchlink" + position).addClass("selected");
    }
    else if (event.key == "Enter" && !$("#searchres").hasClass("hidden") && position!=-1)
    {
        window.location.assign($("#searchlink"+position).attr("href"));
    }
    if (event.key == "ArrowUp" || event.key == "ArrowDown")
        return true;
    else return false;
}

$("#search input").keydown(function (event) {
    if (event.key == "new_escape") {
        $("#search input").blur();
        $("#searchres").addClass("hidden");
    }
    if(event.key == "ArrowUp" || event.key == "ArrowDown")
    {
        event.preventDefault();
    }
});

var last_str = "";

$("#search input").keyup(function (event) {
    var current_str = $("#search input").val();
    if (!check_up_down_arrow(event)) {
        if (current_str != "" && current_str != last_str) {
            position=-1;
            $("#searchres").removeClass("hidden");
            $.getJSON(
                "/api/users",
                {
                    q: current_str,
                    from: 0,
                    count: 5
                },
                function (data, status) {
                    if (status == "success") {
                        $("#searchres").html("");
                        var counter = 0;
                        data.forEach(function (user) {
                            var starting_index = user[0].toLowerCase().indexOf(current_str.toLowerCase());
                            var before = user[0].substring(0, starting_index);
                            var after = user[0].substring(starting_index + current_str.length, user[0].length)
                            var same = user[0].substring(starting_index, starting_index + current_str.length)

                            var template_data = {
                                user_name: user[0],
                                counter: counter,
                                before: before,
                                same: same,
                                after: after
                            }
                            var template = 
                                "<a href=\"/u/{{ user_name }}\" class=\"searchlink\" id=\"searchlink{{ counter }}\">"+
                                "<canvas class=\"usericon\" id=\"searchicon{{ counter }}\" width=\"100px\" height=\"100px\"></canvas>"+
                                "<p>{{ before }}<b>{{ same }}</b>{{ after }}</p>"+
                                "<script>draw_icon(\"{{ user_name }}\",\"searchicon{{ counter }}\")</script></a>";
                                
                            var entry = Mustache.render(template,template_data);
                            $("#searchres").html($("#searchres").html() + entry);
                            counter += 1;
                        });
                        if (data.length == 0) {
                            $("#searchres").html("<p class=\"search noresults\">No results were found</p>");
                        }
                        current_res = data.length;
                    }
                }
            );
        }
        else if (current_str == "") {
            position=-1;
            $("#searchres").html("");
            $("#searchres").addClass("hidden");
        }
        last_str = current_str;
    }
});