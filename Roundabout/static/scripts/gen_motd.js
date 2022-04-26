function motd() {
    var d = new Date()
    Math.seedrandom(d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate());
    var motd_list = [
        "Set your words free.",
        "Unleash your ideas.",
        "Free to think."
    ];
    var index = parseInt((Math.random() * motd_list.length), 10);
    return motd_list[index];
}