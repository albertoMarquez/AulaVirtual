
var user;
$(document).ready(function() {
    $("#cabecera").load("cabecera.html",function(responseTxt, statusTxt, xhr){
        if(statusTxt == "success"){
            $("#desconectar").removeClass("hidden");
            $("#desconectar").click(function(event) {
                $.galleta().setc("usuario", "undefined", "Thu, 01 Jan 1970 00:00:01 GMT");
                var link = window.location.href;
                var res = link.split("/");
                window.location = res[1] + "/";
            });
        }  
    });
    //alert(getCookie("usuario").toString());
    var options={}
    $.galleta(options);
    user = $.galleta().getc("usuario");
    if(user != "undefined"){
        user = JSON.parse(user);

        //alert(user);
        if( user.user.localeCompare("profesor")===0){
            $("#menu").load("menuProfesor.html");
        }else if(user.user.localeCompare("alumno")===0){
            $("#menu").load("menuAlumno.html");
        }
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
            alert("Error al crear la asignatura.");
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
            alert("se ha eliminado correctamente");
            var link = window.location.href;
            var res = link.split("/");
            window.location = res[1] + "/crearAsignatura.html";
        },
        error: function() {
            alert("Error al eliminar la asignatura.");
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