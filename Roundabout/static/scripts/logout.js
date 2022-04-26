
var logging_out = false;
function logout()
{
    if(!logging_out)
    {
        logging_out = true;
        $.get(
            "/api/logout",
            {},
            function (data, status)
            {
                if(status == "success")
                {
                    window.location.reload();
                }
                logging_out = false;
            }
        );
    }
}