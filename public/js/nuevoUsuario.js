$(document).ready(function() {
    $("#cabecera").load("cabecera.html");

    $("#login").click(function(event) {
        event.preventDefault();
        alert("nuevo usuario");
        nuevoUser();
    });

});

function nuevoUser() {
    nombreUsuario = $("#nombre").val();
    passwordUsuario = $("#password").val();
    correoUsuario = $("#correo").val();
    /*console.log("nombre " + nombreUsuario);
    console.log("password " + passwordUsuario);
    console.log("correo " + correoUsuario);*/
    $.ajax({
        method: "POST",
        url: "/nuevoUser",
        contentType: "application/json",
        data: JSON.stringify({ nombre: nombreUsuario, password: passwordUsuario, correo: correoUsuario}),
        success: function() {
           alert("Profesor creado correctamente");

        },
        error: function() {
            alert("Error al crear nuevo usuario.");
        }
    })
}