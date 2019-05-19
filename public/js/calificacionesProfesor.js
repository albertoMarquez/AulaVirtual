var user;
var tableData;
let asig, grupo, tipo, cursoGrupo;
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
            asig = $(this).find(':selected').data('idAsig');
            //console.log(asig);
            listarCursoYgrupo(asig);
        });

        $("#cursoGrupo").on('change', function() {
            grupo = $(this).find(':selected').data('idGrupo');
            cursoGrupo = $(this).find(':selected').text();
            console.log(grupo);
            if(asig !== undefined && grupo !== undefined ){
               // $("tbody .elem").remove();
                cargarListaAlumnos(grupo);
            }
        });
       
       /* $("#problema").on('change', function(){
            tipo = $(this).find(':selected').val();
            // console.log(tipo);
            if(asig !== undefined && grupo !== undefined ){
                // $("tbody .elem").remove();
                cargarListaAlumnos(grupo);
            }
        });*/

        if(tipo !== undefined){
            $("#problema").val(tipo).change();
        }
    }
    else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
});

//se da por supuesto que el idA y el idG pertenecen al profesor logueado
//por lo que en la query no hace falta dicha comprobación
 
function cargarListaAlumnos(idGrupo){
    $.ajax({
        method: "GET",
        url: "/alumnosPorgrupo",
        contentType: "application/json",
        data: {idGrupo:idGrupo},
        success: function(data) {
            console.log(data);
            $('#tablaA').DataTable().clear().destroy();

            var el = $("<tr>").attr("id", "template");
            el.addClass("hidden");
            row = $("<td>").attr("id", "idAlumno");
            el.append(row);
            var row = $("<td>").attr("id", "correo");
            el.append(row);
            row = $("<td>").attr("id", "nombre");
            el.append(row);
            row = $("<td>").attr("id", "apellidos");
            el.append(row);
            
            $("tbody").append(el);

            data.forEach(e => { 

                var elem = $("#template").clone();
                
                elem.find("#idAlumno").text(e.idAlumno);
                elem.find("#correo").text(e.correo);
                elem.find("#nombre").text(e.nombre);
                elem.find("#apellidos").text(e.apellidos);

                elem.attr("id", "");
                elem.removeClass("hidden");
                elem.attr("class", "elem");
                $("#template").before(elem);
            });

            tableData = $('#tablaA').DataTable({
                "oLanguage": {
                    "sSearch": "Filtro de búsqueda:",
                    "sEmptyTable": "No hay datos para mostrar",
                    "sInfo": "Hay un total de _TOTAL_ resultados a mostrar (_START_ de _END_)",
                    "sInfoEmpty": "No hay entradas a mostrar",
                    "sLengthMenu": "Mostrando _MENU_ resultados"
                }
            });
            
            $('.dataTables_length').addClass('bs-select');
            // el orden de la tabla lo he sacado de aqui https://mdbootstrap.com/docs/jquery/tables/sort/ 
            // edicionTablaDataTable();

            $('#tablaA').on('click', 'tbody tr', function(){
                // console.log('TR cell textContent : ', this);
                var data = tableData.row( this ).data();
                //console.log(data);
                abrirModal(data);
            }); 
        },
        error: function() {
            alert("Error al mostrar los ejercicios");
        }
    });
}


//ARREGLAR DUPLICADOS
function abrirModal(info){
    // Get the modal
    console.log(info);
   
    var modal = document.getElementById('myModal');
    var span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";
    
    span.onclick = function() {
        modal.style.display = "none";
    }
    //console.log(info);
    $.ajax({
        method: "GET",
        url: "/notasAlumno",
        contentType: "application/json",
        data: {idAlumno: info[0]},
        success: function(data) {
            // modal.style.display = "none";
            console.log("Notas");              
            //console.log(data);
            //$('#tablaN').DataTable().clear().destroy();

            var el = $("<tr>").attr("id", "plantilla");
            el.addClass("hidden");
            row = $("<td>").attr("id", "idEj");
            el.append(row);
            var row = $("<td>").attr("id", "tit");
            el.append(row);
            row = $("<td>").attr("id", "no");
            el.append(row);
            
            $("#bodyNotas").append(el);

            data.forEach(e => { 

                var a = $("#plantilla").clone();
                console.log(a);
                
                a.find("#idEj").text(e.idEjercicio);
                a.find("#tit").text(e.titulo);
                a.find("#no").text(e.nota);

                a.attr("id", "");
                a.removeClass("hidden");
                a.attr("class", "elem");
                $("#bodyNotas #template").after(a);
            });
            /*tableData = $('#tablaN').DataTable({
                "oLanguage": {
                    "sSearch": "Filtro de búsqueda:",
                    "sEmptyTable": "No hay datos para mostrar",
                    "sInfo": "Hay un total de _TOTAL_ resultados a mostrar (_START_ de _END_)",
                    "sInfoEmpty": "No hay entradas a mostrar",
                    "sLengthMenu": "Mostrando _MENU_ resultados"
                }
            });*/
            //$('.dataTables_length').addClass('bs-select');
        },
        error: function(){
            alert("Error al actualizar");
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


