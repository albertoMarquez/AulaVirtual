var user;
$(document).ready(function() {
    var options={}
    $.galleta(options);
    user = $.galleta().getc("usuario");
    
    if(user != "undefined"){
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
                    $.galleta().setc("listarEjercicioOPT", "undefined", "Thu, 01 Jan 1970 00:00:01 GMT");
                    $.galleta().setc("evaluarAlumnoOPT", "undefined", "Thu, 01 Jan 1970 00:00:01 GMT");
                    var link = window.location.href;
                    var res = link.split("/");
                    window.location = res[1] + "/";
                });
            }  
        });
    
        $.ajax({
            method: "GET",
            url: "/mostrarAlumnos",
            contentType: "application/json",
            data: {id:user.idProfesor},
            success: function(data) {
               data.forEach(e => {
                   
                var elem = $("#template").clone();
                elem.find("#nombre").text(e.nombre);
                elem.find("#apellidos").text(e.apellidos);
                elem.find("#correo").text(e.correo);
                elem.find("#contrasenia").text(e.contrasenia);
                elem.find("#curso").text(e.curso);
                elem.find("#grupo").text(e.grupo);
                elem.find("#asignatura").text(e.asignatura);
                elem.removeClass("hidden");
                elem.attr("id", "elem");
                $("#template").before(elem);
               });
               $('#tablaAlumnos').DataTable();
               
               $('.dataTables_length').addClass('bs-select');
               // el orden de la tabla lo he sacado de aqui https://mdbootstrap.com/docs/jquery/tables/sort/ 
            },
            error: function() {
                alert("Error al mostrar los ejercicios");
            }
        });
    }
    else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
});