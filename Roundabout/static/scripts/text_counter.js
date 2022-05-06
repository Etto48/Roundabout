function count_text_and_update_counter(counter_id,textarea_id,max_count) {
    //$(counter_id).text($(textarea_id).val().length+"/"+max_count);
    var value = 56.5487 - ($(textarea_id).val().length * 56.5487 / max_count);
    $(counter_id).css("stroke-dashoffset",value);
    if($(textarea_id).val().length == max_count)
    {
        $(counter_id).css("stroke","red");
    }
    else if($(textarea_id).val().length > max_count - 35)
    {
        $(counter_id).css("stroke","orange");
    }
    else {
        $(counter_id).css("stroke","var(--accent)");
    }
}