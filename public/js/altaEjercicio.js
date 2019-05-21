let idEj, idA;
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
    
        $('#datetimepicker1').datepicker();
        $('#datetimepicker2').datepicker();
    
        $("#btnGuardar").click(function(event) {
            event.preventDefault();
            alta();
        });
    
        listarTodosEjercicios(); 
        listarAsignaturas();
        

        $("#ejercicio").on('change', function(){
            idEj = $(this).find(':selected').data('idEj');
            if(idA !== undefined){
                $(".groupCurso").remove();
                listarCursoYgrupo(idA, idEj);
            }
        });
    
        $('#asignatura').on('change', function() {
            idA = $(this).find(':selected').data('idAsig');
            $(".groupCurso").remove();
            listarCursoYgrupo(idA, idEj);
        });
       
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
});


function listarTodosEjercicios(){
    $.ajax({
        method: "GET",
        url: "/getEjercicios",
        contentType: "application/json",
        success: function(data) {
            console.log(data);
            var cont = 1;
           data.forEach(e => {
            var elem = $(".templateEjercicio").clone();
            elem.text("Ejercicio " + e.idEjercicio + " - " + e.titulo);
            elem.data("idEj", e.idEjercicio);
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

function listarCursoYgrupo(idA, idE){

    $(".groupCurso").remove();
    $.ajax({
        method: "GET",
        url: "/getCursoGrupoNoAlta",
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