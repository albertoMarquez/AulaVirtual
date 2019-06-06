var asig, grupo;
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
    

        $("#subir").click(function(event) {
            event.preventDefault();
            cargarAlumnos();
        });
      
        cargarAsignatura();

        $('#asignatura').on('change', function() {
            asig = $(this).find(':selected').data('idAsig');
            //console.log(asig);
            listarCursoYgrupo(asig);
        });

        $("#cursoGrupo").on('change', function() {
            grupo = $(this).find(':selected').data('idGrupo');
        });
       
    }
    else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
});

// function cargarCursoYGrupo(){
//     $.ajax({
//         method: "GET",
//         url: "/cargarCursoYGrupo",
//         contentType: "application/json",
//         data: {idProfesor:user.idProfesor},
//         success: function(data){
//             //alert("se han cargado correctamente");
//             data.sort;
//             data.forEach(e => {
//                 //optionG.text = e.grupo.toString();
//                 $('#cargarCursoYGrupo').append($('<option>', {
//                     value: e.idGrupo,
//                     text:  e.curso +"º "+ e.grupo + " - " +e.anio
//                 }));
//             });
//         },
//         error: function() {
//             alert("Error al cargar el curso y grupo.");
//         }
//     }) 
// }

function readFile(scriptAlumnos, onLoadCallback){
    var sol;
    var f = document.getElementById(scriptAlumnos).files;
    if (!f.length) {
      alert('Please select a file!');
      return;
    }
    var reader = new FileReader();
    reader.onload = onLoadCallback;
    reader.readAsText(f[0]);
}  

function cargarAlumnos(){
    var alumnos ;
    var cursoYGrupo = grupo;//$( "#cargarCursoYGrupo" ).val();
    if($('input[type=file]')[0].files[0]){
        readFile('scriptAlumnos',function(e){
            alumnos= e.target.result;
            $.ajax({
                method: "POST",
                url: "/scriptAlumnos",
                contentType: "application/json",
                data: JSON.stringify({  cursoYGrupo: cursoYGrupo, script: alumnos,idProfesor:user.idProfesor}),
                success: function(data){
                    alert("se han cargado correctamente los alumnos");
                    var link = window.location.href;
                    var res = link.split("/");
                    window.location = res[1] + "/principal.html";
                },
                error: function() {
                    alert("Error al cargar los alumnos.");
                }
            })
        });
    }
    else{
        alert("Asegurese de haber subido un archivo");
    }
}

//nuevo
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
        url: "/getCursoGrupoSinAlumnos",
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