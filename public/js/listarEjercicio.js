var idA;
var idG;
var tipo;
var tableData;
var user, modal;
$(document).ready(function() {
    var options={}
    $.galleta(options);
    user = $.galleta().getc("usuario");
    console.log(user);
    
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

           $("#tablaEjercicios").on('click', 'tbody tr', function(){
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

function abrirModal(info){
    // Get the modal
    // console.log(info);
    $(".scri").remove();
    $.ajax({
        method: "GET",
        url: "/getDataEjercicio",
        data:{idEjercicio:info[0]},
        dataType:"JSON",
        contentType: "application/json",
        success: function(ejercicio) {
            // console.log(ejercicio);
            modal = document.getElementById('myModal');
            var span = document.getElementsByClassName("close")[0];
            modal.style.display = "block";

            $("#tituloEjer").text(ejercicio.titulo);
            $("#tituloInput").attr("value", ejercicio.titulo);
            $("#scriptTablas").val(ejercicio.creacionTablas);
            $("#scriptSolucion").val(ejercicio.solucionProfesor);

            var cont = 1;
            ejercicio.scripts.forEach(e=>{
                var elem = $(".templateModal").clone();
                elem.find("#idPrueba").text("Prueba " + cont);
                elem.find("#prueba").val(e.script);
                elem.find("input").attr("value", e.idPrueba);
                elem.removeClass("hidden");
                elem.removeClass("templateModal");
                elem.addClass("scri");

                $(".templateModal").before(elem);
                cont = cont + 1;

            });

            $("#actualizar").on('click', function(e){
                //primero elimino los scripts
                var sol = {};
                sol.idEjercicio = info[0];
                var selectedValues = $('input[type=checkbox]:checked').map(function(){return this.value;});
                sol.scriptsDelete = selectedValues;

                $.ajax({
                    method: "POST",
                    url: "/deleteScripts",
                    data:JSON.stringify({data:sol}),
                    contentType: "application/json",
                    success: function() {
                        //los scripts se han borrado satisfactoriamente
                        //actualizar el resto de información
                       actualizarInformacion(ejercicio.scripts, info[0]);
                        
                    },
                    error: function() {
                        alert("Error al mostrar los ejercicios");
                    }
                })
                
            });


            span.onclick = function() {
                modal.style.display = "none";
            }
       },
        error: function(){
            alert("Error al recuperar entrega");
        }
    })
}

function actualizarInformacion(scriptsPruebas, idEjercicio){
    // console.log(scriptsPruebas);
    var  enun = $('input[type=file]')[0].files[0];
    var scriptNuevo = $('input[type=file]')[1].files[0];
    var titulo = $("#tituloInput").val();
    var scriptTablas = $("#scriptTablas").val();
    var scriptSolucion = $("#scriptSolucion").val();


    var scriptTablas64 = "data:text/plain;base64,";
    scriptTablas64 += utf8_to_b64(scriptTablas);
    var scrSol64 = "data:text/plain;base64,"
    scrSol64 += utf8_to_b64(scriptSolucion);
    var info;
    if(enun !== undefined){ //hay enunciado
        getBase64(enun).then(enunciado =>{
            var enun64 = enunciado;
            if(script !== undefined){ // hay script
                getBase64(script).then(script =>{
                    var script64 = script;
                    info = {idEjercicio:idEjercicio,
                        idProfesor:user.idProfesor, 
                        usuario:user.nombre,
                        scriptPruebas:scriptsPruebas,  
                        titulo:titulo, 
                        scriptTablas64:scriptTablas64, 
                        scriptTablas:scriptTablas, 
                        scrSolucion64:scrSol64, 
                        scrSolucion:scriptSolucion,
                        enun:enun64, 
                        script64:script64
                    };
                    actualizarEjercicio(info);
                });
            }else{ // hay enunciado pero no script
                info = {idEjercicio:idEjercicio,
                    idProfesor:user.idProfesor, 
                    usuario:user.nombre,
                    scriptPruebas:scriptsPruebas,  
                    titulo:titulo, 
                    scriptTablas64:scriptTablas64, 
                    scriptTablas:scriptTablas, 
                    scrSolucion64:scrSol64, 
                    scrSolucion:scriptSolucion,
                    enun:enun64};
                actualizarEjercicio(info);
            }
        });
    }else{ // no hay enunciado
        if(scriptNuevo !== undefined){ // hay script
            getBase64(scriptNuevo).then(script =>{
                var script64 = script;
                info = {idEjercicio:idEjercicio,
                    idProfesor:user.idProfesor, 
                    usuario:user.nombre,
                    scriptPruebas:scriptsPruebas,  
                    titulo:titulo, 
                    scriptTablas64:scriptTablas64, 
                    scriptTablas:scriptTablas, 
                    scrSolucion64:scrSol64, 
                    scrSolucion:scriptSolucion,
                    script64:script64
                    };
                actualizarEjercicio(info);
            });
        }else{
            info = {idEjercicio:idEjercicio,
                idProfesor:user.idProfesor, 
                usuario:user.nombre,
                scriptPruebas:scriptsPruebas,  
                titulo:titulo, 
                scriptTablas64:scriptTablas64, 
                scriptTablas:scriptTablas, 
                scrSolucion64:scrSol64, 
                scrSolucion:scriptSolucion};
            actualizarEjercicio(info);
        }
    }     
}

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent( str )));
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
}

function actualizarEjercicio(info){
    $.ajax({
        method: "POST",
        url: "/actualizarEjercicio",
        data:JSON.stringify({info:info}),
        contentType: "application/json",
        success: function() {
            modal.style.display = "none";
            alert("actualizado!");
            
        },
        error: function() {
            alert("Error al actualizar los ejercicios");
        }
    });
}