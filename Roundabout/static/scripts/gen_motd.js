function motd() {
    var d = new Date()
    Math.seedrandom(d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate());
    var motd_list = [
        "Set your words free.",
        "Unleash your ideas.",
        "Free to think."
    ];
    var index = parseInt((Math.random() * 100), motd_list.length);
    return motd_list[index];
}