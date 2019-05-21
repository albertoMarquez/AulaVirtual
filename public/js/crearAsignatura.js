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
                    var link = window.location.href;
                    var res = link.split("/");
                    window.location = res[1] + "/";
                });
            }  
        });
    
        $("#BCrearAsignatura").click(function(event) {
            event.preventDefault();
            crearAsignatura();
        });
        $("#BEliminarAsignatura").click(function(event) {
            event.preventDefault();
            eliminarAsignatura();
        });
       
        cargarAsignatura();
    
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
   
});

function crearAsignatura(){
    var asignatura = document.getElementById("nombreAsignatura").value;
    var curso = $("#cursoAsignatura").val();
    $.ajax({
        method: "POST",
        url: "/crearAsignatura",
        contentType: "application/json",
        data: JSON.stringify({asignatura:asignatura, curso:curso}),
        success: function(){
            alert("Se ha creado correctamente la asignaura");
            var link = window.location.href;
            var res = link.split("/");
            window.location = res[1] + "/crearAsignatura.html";
        },
        error: function() {
            alert("No se ha podido crear la asignatura.");
        }
    }) 
}

function eliminarAsignatura(){
    var asignatura = $("#sEliminarAsignatura").val();
    $.ajax({
        method: "POST",
        url: "/eliminarAsignatura",
        contentType: "application/json",
        data: JSON.stringify({ asignatura: asignatura}),
        success: function(){
            alert("Se ha eliminado correctamente la asignatura");
            var link = window.location.href;
            var res = link.split("/");
            window.location = res[1] + "/crearAsignatura.html";
        },
        error: function() {
            alert("La asignatura tiene grupos asociados. Elimine primero los grupos asociados a esta asignatura.");
        }
    }) 
}

function cargarAsignatura(){
    $.ajax({
        method: "POST",
        url: "/cargarAsignaturas",
        contentType: "application/json",
        data: JSON.stringify({idProfesor:user.idProfesor}),
        success: function(data){
            //alert("se han cargado correctamente");
            //data.sort;
            //console.log(data);
            data.forEach(e => {
                $('#sEliminarAsignatura').append($('<option>', {
                    value: e.idAsignatura,
                    text:  e.descripcion.toString()
                }));
                $('#sMostrarAsignatura').append($('<option>', {
                    value: e.idAsignatura,
                    text:  e.descripcion.toString()
                }));
            });
        },
        error: function() {
            alert("Error al cargar asignaturas.");
        }
    }) 
}