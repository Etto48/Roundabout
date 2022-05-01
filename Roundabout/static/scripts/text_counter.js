function count_text_and_update_counter(counter_id,textarea_id,max_count) {
    $(counter_id).text($(textarea_id).val().length+"/"+max_count);
}