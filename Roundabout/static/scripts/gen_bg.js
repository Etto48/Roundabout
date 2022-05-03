
function randomColorCouple() {
    function rng(min,max) {
        return Math.random() * (max - min) + min;
    }

    function rchoice(arr) {
        var index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }

    var h_offset = 50;
    var h = rng(0,360);
    var s = rng(50,100);
    var s2 = rng(50,100);
    var l = rng(35,65);
    var l2 = rng(35,65);
    var a = 0.4;
    var deg = rchoice([120,240,90,180,270,30,-30]);
    return `hsla(${h+h_offset},${s}%,${l}%,${a}), hsla(${h+deg+h_offset},${s2}%,${l2}%,${a})`;
}

function gen_bg(seed,id) {
    Math.seedrandom("!"+seed+"!");
    var colors = randomColorCouple();
    var angle = Math.floor(Math.random() * 360);
    $("#"+id).css("background",`linear-gradient(${angle}deg, ${colors})`);
}