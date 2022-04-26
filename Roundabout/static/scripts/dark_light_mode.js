function set_dark_mode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.theme = 'dark';
}

function set_light_mode() {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.theme = 'light';
}

function load_theme() {
    if(localStorage.theme == 'light') {
        set_light_mode();
    }
    else if(localStorage.theme == 'dark') {
        set_dark_mode();
    }
    else {
        let light = window.matchMedia('(prefers-color-scheme: light)').matches;
        if(light) {
            set_light_mode();
        }
        else {
            set_dark_mode();
        }
    }
}

load_theme();