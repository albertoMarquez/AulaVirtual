var user;
let valAsig, curso, idGrupo;
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
    
        listarAsignaturas();
        $("#asig").val(0).change();
        $("#anioSelect").val(0).change();

        

        $('#asig').on('change', function() {
            valAsig = $(this).find(':selected').data('idAsig');
            curso =  $(this).find(':selected').data('curso');
            //console.log(valor);
            listarAnios(valAsig, curso);
        });

        $("#anioSelect").on('change', function(){
            idGrupo = $(this).find(':selected').data('idGrupo');
            cargarTablaEjercicios(valAsig);
        });


        
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
    
});



function listarAsignaturas(){

    $.ajax({
        method: "GET",
        url: "/getAsignaturasOtrosAnios",
        contentType: "application/json",
        data:{idA: user.idAlumno},
        success: function(data) {
            // console.log(data);
            var cont = 1;
            data.forEach(e => {
             var elem = $(".templateAsignatura").clone();
             elem.text(`${e.descripcion} - ${e.anio}`);
             elem.data("idAsig", e.idAsignatura);
             elem.data("curso", e.curso);
             elem.removeClass("hidden");
             elem.removeClass("templateAsignatura");
             elem.attr("value", cont);
             $(".templateAsignatura").before(elem);
             cont = cont + 1;
            });
        },
        error: function() {
            alert("Error al cargar las asignaturas");
        }
    });
}

function listarAnios(id, curso){

    $(".anioClass").remove();
    $.ajax({
        method: "GET",
        url: "/getCursoGrupoAlumnoAniosPasados",
        contentType: "application/json",
        data:{idA:id, idP:user.idAlumno},
        success: function(data) {
            // console.log(data);          
            var cont = 1;
            data.forEach(e => {
                var elem = $(".templateAnio").clone();
                elem.text(`${curso}º ${e.grupo}`);
                elem.data("idGrupo", e.idGrupo);
                elem.removeClass("hidden");
                elem.removeClass("templateAnio");
                elem.addClass("anioClass");
                elem.attr("value", cont);
                $(".templateAnio").before(elem);
                cont = cont + 1;
            });

           
        },
        error: function() {
            alert("Error al cargar el curso");
        }


    });
}

function parserFecha(f){
    var fecha = new Date(f);
    fecha = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
    return fecha;
}

function cargarTablaEjercicios(){

    $.ajax({
        method: "GET",
        url: "/getTablaEjerciciosAtrasados",
        contentType: "application/json",
        data:{idG:idGrupo},
        success: function(data) {

            $("#tablaDeEjercicios").DataTable().clear().destroy();

            var el = $("<tr>").attr("id", "template");
            el.addClass("hidden");
            var row = $("<td>").attr("id", "titulo");
            el.append(row);
            row = $("<td>").attr("id", "autor");
            el.append(row);
            row = $("<td>").attr("id", "fecha");
            el.append(row);
            row = $("<td>").attr("id", "idEjercicio");
            el.append(row);
            
            $("tbody").append(el);

            
            data.forEach(e=>{
                var elem = $("#template").clone();
                elem.find("#titulo").text(e.titulo);
                elem.find("#autor").text(e.autor);
                elem.find("#idEjercicio").text(e.idEj);
                elem.find("#fecha").text(parserFecha(e.fecha));
                elem.removeClass("hidden");
                elem.removeAttr("id", "template");
                elem.attr("class", "elem");
                $("#template").before(elem);
           });
           var table = $('#tablaDeEjercicios').DataTable({
                "oLanguage": {
                    "sSearch": "Filtro de búsqueda:",
                    "sEmptyTable": "No hay datos para mostrar",
                    "sInfo": "Hay un total de _TOTAL_ resultados a mostrar (_START_ de _END_)",
                    "sInfoEmpty": "No hay entradas a mostrar",
                    "sLengthMenu": "Mostrando _MENU_ resultados"
                }
            });
           
           $('.dataTables_length').addClass('bs-select');

           $('#tablaDeEjercicios').on('click', 'tbody tr', function(){
              var data = table.row(this).data();
              
              console.log(data);
              var link = window.location.href;
              var res = link.split("/");
              window.location = res[1] + "/" + "subirAlumno/" + Number(data[3]) + "/" + user.idAlumno;
             
         });

        },
        error: function(){
            alert("Error al cargar los ejercicios de años anteriores");
        }
    })

}