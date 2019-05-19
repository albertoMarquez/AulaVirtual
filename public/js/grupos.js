
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
        $("#crearCursoYGrupo").click(function(event) {
            event.preventDefault();
            crearCursoYGrupo();
            //cargarCursoYGrupo();
        });
        $("#eliminar").click(function(event) {
            event.preventDefault();
            eliminarCursoYGrupo();
            //cargarCursoYGrupo();
        });
        cargarAsignatura();
        //cargarCursoYGrupo();

        ///
        //carga el desplegable de año en crear
        anio = new Date();
        for (let index = anio.getFullYear()-2; index <= anio.getFullYear()+2; index++) {
            $('#sMostrarAnios').append($('<option>', {
                value:index,
                text: index
            }));
        }
        cargarEliminarAsignatura();
        $('#asignatura').on('change', function() {
            asig = $(this).find(':selected').data('idAsig');
            listarCursoYgrupo(asig);
        });
        //
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
    
});

function crearCursoYGrupo(){
    var asignatura = $("#sMostrarAsignatura").val(); //cojo el id de la asignatura
    var letra = $("#letra").val(); //cojo la letra
    var anio = $("#sMostrarAnios").val(); //cojo el año

    $.ajax({
        method: "POST",
        url: "/crearCursoYGrupo",
        contentType: "application/json",
        data: JSON.stringify({asig:asignatura, letra:letra, anio:anio, idProfesor:user.idProfesor}),
        success: function(){
            alert("se han creado correctamente");
            var link = window.location.href;
            var res = link.split("/");
            window.location = res[1] + "/grupos.html";
        },
        error: function() {
            alert("Error al crear el grupo.");
        }
    }) 
}

function eliminarCursoYGrupo(){
    var idGrupo = $("#cursoGrupo").find(':selected').data('idGrupo');
    //alert("idgrupo :"+ idGrupo);
    $.ajax({
        method: "POST",
        url: "/eliminarCursoYGrupo",
        contentType: "application/json",
        data: JSON.stringify({idGrupo: idGrupo, idProfesor: user.idProfesor}),
        success: function(){
            alert("se han eliminado correctamente");
            var link = window.location.href;
            var res = link.split("/");
            window.location = res[1] + "/grupos.html";
        },
        error: function() {
            alert("Error al eliminar el grupo.");
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
            data.forEach(e => {
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

function cargarEliminarAsignatura(){
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
            console.log(data);
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
/*function cargarCursoYGrupo(){
    $.ajax({
        method: "GET",
        url: "/cargarCursoYGrupo",
        contentType: "application/json",
        data: {idProfesor:user.idProfesor},
        success: function(data){
            //alert("se han cargado correctamente");
            data.sort;
            data.forEach(e => {
                //optionG.text = e.grupo.toString();
                $('#eliminarCursoYGrupo').append($('<option>', {
                    value: e.idGrupo,
                    text:  e.curso +"º "+ e.grupo + " - " +e.anio
                }));
            });
        },
        error: function() {
            alert("Error al cargar el curso y grupo.");
        }
    }) 
}*/