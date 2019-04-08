(function ( $ ) {
    var export_function = {};
    $.galleta = function(options){
        if(!options)
            return export_function;
        var settings = $.extend({}, options );

        var init = function(){
            export_function.setc = setCookie;
            export_function.getc = getCookie;
            export_function.check = checkCookie;
            inited = true;
            return export_function;
        }
        var setCookie = function(cname,cvalue,exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires=" + d.toGMTString();
            return document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }
        ///ver como cojo la cucki sin tanto follon
        var getCookie = function(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }
        var checkCookie = function() {
            var user=getCookie("username");
            if (user != "") {
                alert("Welcome again " + user);
            } else {
               user = prompt("Please enter your name:","");
               if (user != "" && user != null) {
                   setCookie("username", user, 1);
               }
            }
        }
        init();
    };
}( jQuery ));