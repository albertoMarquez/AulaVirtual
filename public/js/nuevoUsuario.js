var user;
$(document).ready(function() {
    var options={}
    $.galleta(options);
    user = $.galleta().getc("usuario");
    //console.log( user);
    if(user != "undefined"){
        console.log( user);
        user = JSON.parse(user);
        $("#cabecera").load("cabecera.html",function(responseTxt, statusTxt, xhr){
            if(statusTxt == "success"){
                $("#nombre_usuario").text(user.nombre);
                $("#roll_usuario").text(user.user + " :");
                if( user.user.localeCompare("profesor")===0){
                    $("#menu").load("menuProfesor.html");
                    $(".ejs_ex").addClass("hidden");
                    $("#aYG").addClass("hidden");
                }else if(user.user.localeCompare("alumno")===0){
                    $("#menu").load("menuAlumno.html");
                    $("#aYG_usuario").text(user.descripcion +" "+user.curso+"º"+user.grupo);
                }
                
                $("#desconectar").click(function(event) {
                    $.galleta().setc("usuario", "undefined", "Thu, 01 Jan 1970 00:00:01 GMT");
                    var link = window.location.href;
                    var res = link.split("/");
                    window.location = res[1] + "/";
                });
            }  
        });
    }
    $("#login").click(function(event) {
        nuevoUser();
    });
    
});

function nuevoUser() {
    nombreUsuario = $("#nombre").val();
    passwordUsuario = $("#password").val();
    correoUsuario = $("#correo").val();
    console.log("nombre " + nombreUsuario);
    console.log("password " + passwordUsuario);
    console.log("correo " + correoUsuario);
    $.ajax({
        method: "POST",
        url: "/nuevoUser",
        contentType: "application/json",
        data: JSON.stringify({ nombre: nombreUsuario, password: passwordUsuario, correo: correoUsuario}),
        success: function() {
            alert("Profesor creado correctamente");
            if(user != "undefined"){
                location.reload();
            }
            var link = window.location.href;
            var res = link.split("/");
            window.location = res[1] + "/";
        },
        error: function() {
            alert("Error al crear nuevo usuario.");
        }
    })
}