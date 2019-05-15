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
            $("#roll_usuario").text(user.user);
            $("#desconectar").removeClass("hidden");
            $("#desconectar").click(function(event) {
                $.galleta().setc("usuario", "undefined", "Thu, 01 Jan 1970 00:00:01 GMT");
                var link = window.location.href;
                var res = link.split("/");
                window.location = res[1] + "/";
            });
        }  
    });
        if( user.user.localeCompare("profesor")===0){
            $("#menu").load("menuProfesor.html");
        }else if(user.user.localeCompare("alumno")===0){
            $("#menu").load("menuAlumno.html");
        }
        $('#datetimepicker1').datepicker();
        $('#datetimepicker2').datepicker();
    
        $("#btnGuardar").click(function(event) {
            event.preventDefault();
            alta();
        });
    
        listarEjercicios(); 
        listarAsignaturas();
    
        $('#asignatura').on('change', function() {
            let valor = $(this).find(':selected').data('idAsig');
            listarCursoYgrupo(valor);
        });
       
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
});


function listarEjercicios(){
    $.ajax({
        method: "GET",
        url: "/getEjercicios",
        contentType: "application/json",
        success: function(data) {
            var cont = 1;
           data.forEach(e => {
            var elem = $(".templateEjercicio").clone();
            elem.text("Ejercicio " + e.id + " - " + e.titulo);
            elem.data("idEj", e.id);
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

function listarAsignaturas(){
    
    $.ajax({
        method: "GET",
        url: "/getAsignaturas",
        contentType: "application/json",
        data:{id:user.idProfesor},
        success: function(data) {
            var cont = 1;
           data.forEach(e => {
            var elem = $(".templateAsignatura").clone();
            elem.text(e.descripcion);
            elem.data("idAsig", e.id);
            elem.removeClass("hidden");
            elem.removeClass("templateAsignatura");
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

function listarCursoYgrupo(idA){

    $(".groupCurso").remove();
    $.ajax({
        method: "GET",
        url: "/getCursoGrupo",
        data:{id:idA, idP:user.idProfesor},
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

function alta(){

    var info = {};
    info.idEjercicio = $("#ejercicio").find(':selected').data('idEj');
    info.examen = $("input[name='optradio']:checked").val();
    info.idAsignatua =  $("#asignatura").find(':selected').data('idAsig');
    info.idGrupo = $("#curso").find(':selected').data('idGrupo');
    info.ini = $("#ini").val();
    info.fin = $("#fin").val();
    info.numIntentos= $("#intentos").val();


    $.ajax({
        method: "POST",
        url: "/altaEjercicio",
        contentType: "application/json",
        data:JSON.stringify({ejer:info}),
        success: function() {
           alert("Ejercicio dado de alta correctamente");
           location.reload();
        },
        error: function() {
            alert("Error al mostrar los ejercicios");
        }
    });
}