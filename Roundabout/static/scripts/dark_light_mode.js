function set_dark_mode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.theme = 'dark';
    $("#dark-light-mode").prop("checked",false);
}

function set_light_mode() {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.theme = 'light';
    $("#dark-light-mode").prop("checked",true);
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

function checkbox_dark_light_mode()
{
    if($("#dark-light-mode").prop("checked")==true)
    {
        set_light_mode();
    }
    else
    {
        set_dark_mode();
    }
}
