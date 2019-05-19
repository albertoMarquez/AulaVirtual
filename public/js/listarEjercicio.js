var user;
var idA;
var idG;
var tipo;
var tableData;
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

        cargarAsignatura();

        $('#asignatura').on('change', function() {
            idA = $(this).find(':selected').data('idAsig');
            //console.log(asig);
            listarCursoYgrupo(idA);
        });

        $("#cursoGrupo").on('change', function(){
            idG = $(this).find(':selected').data('idGrupo');
            if(tipo != undefined){
                if(tipo == 1){ //ejercicios dados de alta
                    mostrarListaEjerciciosAlta();
                }else if(tipo == 2){ //ejercicios no asignados
                    mostrarListaEjerciciosNoAsignados();
                }
            }
        });


        $("#problema").on('change', function(){
            tipo = $(this).find(':selected').val();
            if(tipo == 1){ //ejercicios dados de alta
                mostrarListaEjerciciosAlta();
            }else if(tipo == 2){ //ejercicios no asignados
                mostrarListaEjerciciosNoAsignados();
            }
            
        });


    
        
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
    


    
});

function mostrarListaEjerciciosAlta(){
    $("#tablaENA").addClass("hidden");
    $("#tablaE").removeClass("hidden");
    $.ajax({
        method: "GET",
        url: "/mostrarListaEjerAlta",
        contentType: "application/json",
        data: {tipo:tipo, idG:idG, idA:idA, user: user.idProfesor},
        success: function(data) {

            $('#tablaEjercicios').DataTable().clear().destroy();
            $('#tablaEjerciciosNA').DataTable().clear().destroy();

            var el = $("<tr>").attr("id", "template");
            el.addClass("hidden");
            var row = $("<td>").attr("id", "idEjercicio");
            el.append(row);
            row = $("<td>").attr("id", "Titulo");
            el.append(row);
            row = $("<td>").attr("id", "evaluacion");
            el.append(row);
            row = $("<td>").attr("id", "numIntentos");
            el.append(row);
            row = $("<td>").attr("id", "fechaIni");
            el.append(row);
            $("#tablaEjercicios tbody").append(el);

           data.forEach(e => {
            var elem = $("#template").clone();
            elem.find("#idEjercicio").text(e.idEjercicio);
            elem.find("#Titulo").text(e.titulo);
            elem.find("#evaluacion").text(e.evaluacion);
            elem.find("#numIntentos").text(e.numIntentos);
            elem.find("#fechaIni").text(e.ini);
            elem.attr("id", "");
            elem.removeClass("hidden");
            elem.attr("class", "elem");
            $("#template").before(elem);
           
           });
           tableData = $('#tablaEjercicios').DataTable({
            "oLanguage": {
                "sSearch": "Filtro de búsqueda:",
                "sEmptyTable": "No hay datos para mostrar",
                "sInfo": "Hay un total de _TOTAL_ resultados a mostrar (_START_ a _END_)",
                "sInfoEmpty": "No hay entradas a mostrar",
                "sLengthMenu": "Mostrando _MENU_ resultados"
            }
        });
            
           $('.dataTables_length').addClass('bs-select');
           // el orden de la tabla lo he sacado de aqui https://mdbootstrap.com/docs/jquery/tables/sort/ 
           
        },
        error: function() {
            alert("Error al mostrar los ejercicios");
        }
    });

}

function mostrarListaEjerciciosNoAsignados(){
   
    $("#tablaE").addClass("hidden");
    $("#tablaENA").removeClass("hidden");
    $.ajax({
        method: "GET",
        url: "/mostrarListaEjerNoAsignados",
        contentType: "application/json",
        data: {tipo:tipo, idG:idG, idA:idA, user: user.idProfesor},
        success: function(data) {

            $('#tablaEjerciciosNA').DataTable().clear().destroy();
            $('#tablaEjercicios').DataTable().clear().destroy();

            var el = $("<tr>").attr("id", "template");
            el.addClass("hidden");
            var row = $("<td>").attr("id", "idEjercicio");
            el.append(row);
            row = $("<td>").attr("id", "Titulo");
            el.append(row);
            row = $("<td>").attr("id", "numScripts");
            el.append(row);
           
            $("#tablaEjerciciosNA tbody").append(el);

           data.forEach(e => {
            var elem = $("#template").clone();
            elem.find("#idEjercicio").text(e.idEjercicio);
            elem.find("#Titulo").text(e.titulo);
            elem.find("#numScripts").text(e.numScripts);
            elem.attr("id", "");
            elem.removeClass("hidden");
            elem.attr("class", "elem");
            $("#template").before(elem);
           
           });
           tableData = $('#tablaEjerciciosNA').DataTable({
            "oLanguage": {
                "sSearch": "Filtro de búsqueda:",
                "sEmptyTable": "No hay datos para mostrar",
                "sInfo": "Hay un total de _TOTAL_ resultados a mostrar (_START_ a _END_)",
                "sInfoEmpty": "No hay entradas a mostrar",
                "sLengthMenu": "Mostrando _MENU_ resultados"
            }
        });
            
           $('.dataTables_length').addClass('bs-select');
           // el orden de la tabla lo he sacado de aqui https://mdbootstrap.com/docs/jquery/tables/sort/ 
           
        },
        error: function() {
            alert("Error al mostrar los ejercicios");
        }
    });

}

function cargarAsignatura(){
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
            var elem = $(".templateCursoGrupo").clone();
            elem.text(e.curso + "º " + e.grupo);
            elem.data("idGrupo", e.idGrupo);
            elem.removeClass("hidden");
            elem.removeClass("templateCursoGrupo");
            elem.addClass("groupCurso");
            elem.attr("value", cont);
            $(".templateCursoGrupo").before(elem);
            cont = cont + 1;
           });
        },
        error: function() {
            alert("Error al mostrar los ejercicios");
        }
    });
}