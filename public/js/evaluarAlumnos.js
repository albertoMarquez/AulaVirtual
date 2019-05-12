//falta arreglar todo desde aqui
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
    var options={}
    $.galleta(options);
    user = $.galleta().getc("usuario");
    if(user !== "undefined"){
        user = JSON.parse(user);

    
        if( user.user.localeCompare("profesor")===0){
            $("#menu").load("menuProfesor.html");
        }else if(user.user.localeCompare("alumno")===0){
            $("#menu").load("menuAlumno.html");
        }
        
        cargarAsignatura();
        let asig, grupo, tipo, cursoGrupo;
       
        $('#asignatura').on('change', function() {
            asig = $(this).find(':selected').data('idAsig');
            listarCursoYgrupo(asig);
        });

        $("#cursoGrupo").on('change', function() {
            grupo = $(this).find(':selected').data('idGrupo');
            cursoGrupo = $(this).find(':selected').text();
           // console.log(grupo);
           if(asig !== undefined && grupo !== undefined && tipo !== undefined){
                cargarListaAlumnosEvaluar(asig, grupo, tipo, cursoGrupo);
            }
        });
       
        $("#problema").on('change', function(){
            tipo = $(this).find(':selected').val();
           // console.log(tipo);
           if(asig !== undefined && grupo !== undefined && tipo !== undefined){
           // var row = document.getElementsByTagName('tbody')[0];
            //row.parentNode.removeChild(row);
            $("tbody .elem").remove();
                cargarListaAlumnosEvaluar(asig, grupo, tipo, cursoGrupo);
            }
        });
    }
    else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
});

//se da por supuesto que el idA y el idG pertenecen al profesor logueado
//por lo que en la query no hace falta dicha comprobación
function cargarListaAlumnosEvaluar(idA, idG, tipoEjer, cursoGrupo){
    $.ajax({
        method: "GET",
        url: "/evaluaAlumno",
        contentType: "application/json",
        data: {asig:idA, grupo:idG, tipo:tipoEjer},
        success: function(data) {
            data.forEach(e => { 
                
                var elem = $("#template").clone();
                elem.find("#nombre").text(e.nombre);
                elem.find("#idAlumno").text(e.idAlumno);
                elem.find("#apellidos").text(e.apellidos);
                elem.find("#idEjer").text(e.idEjer);
                elem.find("#titulo").text(e.titulo);
                elem.find("#numScripts").text(e.numScripts);
                elem.find("#cursoGrupo").text(cursoGrupo);
                elem.find("#intentos").text(e.intentos);
                elem.find("#resultado").text(e.resultado);
                elem.find("#nota").text(e.nota);
                elem.data("idAlumno", e.idAlumno);

                elem.removeClass("hidden");
                elem.attr("class", "elem");
                $("#template").before(elem);
            });

            $('#tablaA').DataTable();
            var table = $('#tablaA').DataTable();
            $('.dataTables_length').addClass('bs-select');
            // el orden de la tabla lo he sacado de aqui https://mdbootstrap.com/docs/jquery/tables/sort/ 
            $('#tablaA').on('click', 'tbody tr', function(){
                // console.log('TR cell textContent : ', this);
                var data = table.row( this ).data();
                //console.log(data);
                abrirModal(data);
            });
        },
        error: function() {
            alert("Error al mostrar los ejercicios");
        }
    });
}



function abrirModal(info){
    // Get the modal
    console.log(info);

    $.ajax({
        method: "GET",
        url: "/getUltimaEntrega",
        data:{idEjercicio:info[2], idAlumno: info[0]},
        dataType:"JSON",
        contentType: "application/json",
        success: function(ultimaEntrega) {
            var modal = document.getElementById('myModal');
            var span = document.getElementsByClassName("close")[0];
            modal.style.display = "block";
            //console.log("Modal");
            //console.log(info);
            $("#nombreModal").text(info[1]);
            $("#notaModal").val(info[8]);
            // When the user clicks on <span> (x), close the modal
            $("#solucionAlumnoModal").val(ultimaEntrega.solAlumno);
            $("#solucionOracleAlumno").val(info[7]);
            span.onclick = function() {
                modal.style.display = "none";
            }

            $("#botonModal").click(function(event) {
                event.preventDefault();
                $.ajax({
                    method: "POST",
                    url: "/actualizaComentarioNota",
                    contentType: "application/json",
                    data: JSON.stringify({idEjercicio:info[2], idAlumno: info[0], nota: $("#notaModal").val(), comentario: $("#solucionAlumnoModal").val()}),
                    success: function() {
                       // alert("Actualizado correctamente");
                        modal.style.display = "none";
                        location.reload();
                    },
                    error: function(){
                        alert("Error al actualizar");
                    }
                });
            });
        },
        error: function(){
            alert("Error al recuperar entrega");
        }
    })
}

function entregaRetrasada(idEjercicio){
    let fechaSubida = new Date();
    //let idEj = idEjercicio;
    info = {idEjercicio: idEjercicio};
    console.log("id" + info.idEjercicio);
    $.ajax({
        method: "POST",
        url: "/entregaRetrasada",
        data: JSON.stringify(info),
        dataType:"JSON",
        contentType: "application/json",
        success: function(fechaFin) {
            let fechaF = new Date(fechaFin);
            if(fechaF > fechaSubida)
                alert("Fecha retrasada");
        },
        error: function() {
            alert("Error al comprobar la fecha de entrega");
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