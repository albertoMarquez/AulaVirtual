var idE;
var idA;
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
    
        $("#btnGuardar").click(function(event) {
            event.preventDefault();

            comprobarBorrado();
        });
    
        listarEjerciciosAlta(); 

        $("#ejercicio").on('change', function(e){
            idE = $(this).find(':selected').data('idEj');
            listarAsignaturas(idE);
        });

        $("#asignatura").on('change', function(){
            idA = $(this).find(':selected').data('idAsig');
            listarCursoyGrupo(idE, idA);
        });
       
       
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
});

function listarEjerciciosAlta(){
    $.ajax({
        method: "GET",
        url: "/listarBajaEjercicio",
        contentType: "application/json",
        data: {id: user.idProfesor},
        success: function(data) {

            console.log(data);
            var cont = 1;
           data.forEach(e => {
            var elem = $(".templateEjercicio").clone();
            elem.text("Ejercicio " + e.idEj + " - " + e.titulo);
            elem.data("idEj", e.idEj);
            elem.removeClass("hidden");
            elem.removeClass("templateEjercicio");
            elem.attr("value", cont);
            $(".templateEjercicio").before(elem);
            cont = cont + 1;
           });
        },
        error: function() {
            alert("Error al mostrar los ejercicios");
        }
    });
}


function listarAsignaturas(idE){
    $(".asign").remove();
    $.ajax({
        method: "GET",
        url: "/getAsignaturasEjercicioGrupo",
        contentType: "application/json",
        data:{id:user.idProfesor, idE:idE},
        success: function(data) {
            var cont = 1;
           data.forEach(e => {
            var elem = $(".templateAsignatura").clone();
            elem.text(e.descripcion);
            elem.data("idAsig", e.id);
            elem.removeClass("hidden");
            elem.removeClass("templateAsignatura");
            elem.addClass("asign");
            elem.attr("value", cont);
            $(".templateAsignatura").before(elem);
            cont = cont + 1;
           });
        },
        error: function() {
            alert("Error al cargar la asignatura");
        }
    });
}

function listarCursoyGrupo(idE, idA){
    $(".groupCurso").remove();
    $.ajax({
        method: "GET",
        url: "/getCursoGrupoEjerAlta",
        data:{idA:idA, idP:user.idProfesor, idE:idE},
        contentType: "application/json",
        success: function(data) {
            var cont = 1;
           data.forEach(e => { 
            var elem = $(".templateCurso").clone();
            elem.text(e.curso + "º " + e.grupo);
            elem.data("idGrupo", e.idGrupo);
            elem.removeClass("hidden");
            elem.removeClass("templateCurso");
            elem.addClass("groupCurso");
            elem.attr("value", cont);
            $(".templateCurso").before(elem);
            cont = cont + 1;
           });
        },
        error: function() {
            alert("Error al mostrar los ejercicios");
        }
    });
}

function baja(){
    var info = {};
    info.idEjercicio = idE;
    info.idAsignatua =  idA;
    info.idGrupo = $("#curso").find(':selected').data('idGrupo');
    $.ajax({
        method: "POST",
        url: "/bajaEjercicio",
        contentType: "application/json",
        data:JSON.stringify({ejer:info}),
        success: function() {
           alert("Ejercicio dado de baja correctamente");
           location.reload();
        },
        error: function() {
            alert("Error al dar de baja un ejercicio");
        }
    });
}

function comprobarBorrado(){
    var info = {};
    info.idEjercicio = idE;
    info.idAsignatua =  idA;
    info.idGrupo = $("#curso").find(':selected').data('idGrupo');
    $.ajax({
        method: "GET",
        url: "/comprobarBorrado",
        contentType: "application/json",
        data:{ejer:info},
        success: function(data) {
            console.log(data);
            if(data === true){
                baja();
            }else{
                var mensaje = `El ejercicio ha sido intentado por al menos un alumno, ¿Estás seguro de querer darlo de baja? 

Nota: Los ejercicios de los alumnos que intentaron este ejercicio tambien se eliminarán de la base de datos por lo que no podrán recuperar sus soluciones ni comentarios.`;
                var opcion = confirm(mensaje);
                if (opcion === true) {
                    baja();
                }
            }
        },
        error: function() {
            alert("Error al dar de baja un ejercicio");
        }
    });
}