var user;
var pass;

$(document).ready(function() {
    $("#cabecera").load("cabecera.html");
    var options={}
    $.galleta(options);
    user = $.galleta().getc("usuario");
    if(user === ""){
        user = "undefined";
    }
    console.log(user);
   
    if(user !== "undefined"){
        user = $.galleta().getc("usuario");
        user = JSON.parse(user);
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "principal.html";
    }
    else{
        $("#login").click(function(event) {
            //console.log("hola");
            event.preventDefault();
            login();
        });
        $("#cambioPass").click(function(event) {
            event.preventDefault();
            cambiarpass();
        });
    }
});

function login() {
    user= $("#user").val();
    pass = $("#password").val();
    $.ajax({
        method: "POST",
        url: "/login",
        contentType: "application/json",
        data: JSON.stringify({ login: user, password: pass}),
        success: function(usuario){
            //alert(usuario);
            usuAux= usuario;
            usuAux= JSON.stringify(usuAux);//Para castearlo a un objeto y despues cogerlo en ese formato de la cookie cuando lo necesite
            //console.log("entra"+uario);
            //var usu = "usuario2";
            date = new Date();
            $.galleta().setc("usuario",usuAux, 1);
            //$.galleta().setc("usuario2",usu, 1);
            var fecha = new Date(usuario.cambioContrasenia);
            if(fecha.getFullYear() > date.getFullYear() || usuario.user.localeCompare("profesor")===0){//ya ha cambiado su contraseña
                console.log("nocambio");
                //$.galleta().setc("usuario",JSON.stringify({usuAux}), 1);///terminar de hacer esto
                var link = window.location.href;
                var res = link.split("/");
                window.location = res[1] + "principal.html";
            }else{
                console.log("cambio");
                $("#formulario_login").hide();
                $("#formulario_pass").removeClass("hidden");
            }       
        },
        error: function() {
            alert("Error al iniciar sesión.");
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
function cambiarpass() {///Revisar el meter el usuario en la cooki la primera vez que entra
    date = new Date();
    var anio = date.getFullYear()+1;
    date.setFullYear(anio);
    $.ajax({
        method: "POST",
        url: "/cambiarpass",
        contentType: "application/json",
        data: JSON.stringify({user: $("#user").val(), pass1:$("#password1").val(), pass2:$("#password2").val(), date: date}),
        success: function() {
           alert("contraseña cambiada :)");
           window.location = "/principal.html"; 
        },
        error: function() {
            alert("Error al cambiar contraseña.");
        }
    });
}