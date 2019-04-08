
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
    if(user !== "undefined"){
        user = JSON.parse(user);

        //alert(user);
        if( user.user.localeCompare("profesor")===0){
            $("#menu").load("menuProfesor.html");
        }else if(user.user.localeCompare("alumno")===0){
            $("#menu").load("menuAlumno.html");
        }
        $("#subirCursoYGrupo").click(function(event) {
            event.preventDefault();
            crearCursoYGrupo();
            cargarCursoYGrupo();
        });
        $("#eliminar").click(function(event) {
            event.preventDefault();
            eliminarCursoYGrupo();
            cargarCursoYGrupo();
        });
        cargarAsignatura();
        cargarCursoYGrupo();
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
    
});

function crearCursoYGrupo(){
    var asignatura = $("#sMostrarAsignatura").val(); //cojo el id de la asignatura
    var letra = $("#letra").val(); //cojo la letra
    var anio = $("#anio").val(); //cojo el año

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
    var idGrupo = $("#eliminarCursoYGrupo").find(':selected').val();
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

function cargarCursoYGrupo(){
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
}