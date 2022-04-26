$("#account").click(function() 
{
    $("#account-dropdown").toggleClass("show");
    $("#dropdown-arrow").toggleClass("show");
});

window.addEventListener("click",function(event)
{
    if(!$("#account").is(event.target) && $("#account").has(event.target).length===0 && !$("#account-dropdown").is(event.target) && $("#account-dropdown").has(event.target).length===0)
    {
        $("#account-dropdown").removeClass("show");
        $("#dropdown-arrow").removeClass("show");
    }
});