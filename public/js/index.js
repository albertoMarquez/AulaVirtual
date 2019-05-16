var user;
var pass;
$(document).ready(function() {
    $("#cabecera").load("cabecera.html",function(responseTxt, statusTxt, xhr){
        if(statusTxt == "success"){
            $("#nombre").addClass('hidden');
            $("#roll").addClass('hidden');
            $("#desconectar").addClass('hidden')
        }
    });
    
    var options={}
    $.galleta(options);
    user = $.galleta().getc("usuario");

    if(user === ""){
        user = "undefined";
    }   
    if(user !== "undefined"){
        user = $.galleta().getc("usuario");
        user = JSON.parse(user);
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "principal.html";
    }
    else{
        
        $("#login").click(function(event) {
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
            usuAux= usuario;
            usuAux= JSON.stringify(usuAux);//Para castearlo a un objeto y despues cogerlo en ese formato de la cookie cuando lo necesite
            date = new Date();
            $.galleta().setc("usuario",usuAux, 1);
            //$.galleta().setc("usuario2",usu, 1);
            var fecha = new Date(usuario.cambioContrasenia);
            if(fecha.getFullYear() > date.getFullYear() || usuario.user.localeCompare("profesor")===0){//ya ha cambiado su contraseña
                var link = window.location.href;
                var res = link.split("/");
                window.location = res[1] + "principal.html";
            }else{
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