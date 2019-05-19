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
       

        listarAsignaturas();
        let valAsig;

        $('#asig').on('change', function() {
            valAsig = $(this).find(':selected').data('idAsig');
            //console.log(valor);
            listarAnios(valAsig);
        });

        $("#anioSelect").on('change', function(){
            let valor = $(this).find(':selected').text();
            let anio = valor.split("/");
            cargarTablaEjercicios(valAsig, anio[0]);
        });

        $("#asig").val('0');
        $("#anioSelect").val('0');

        
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
            alert("Error al cargar las asignaturas");
        }


    });

}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function listarAnios(id){

    $(".anioClass").remove();
    $.ajax({
        method: "GET",
        url: "/getCursoGrupo/"+ id,
        contentType: "application/json",
        success: function(data) {

            var anios = [];
           
            data.forEach(e=>{
                anios.push(e.anio);
            });

            var unique = anios.filter( onlyUnique );

            var cont = 1;
            unique.forEach(e => {
             var elem = $(".templateAnio").clone();
             elem.text(`${e}/${e+1}`);
             //elem.data("idAsig", e.id);
             elem.removeClass("hidden");
             elem.removeClass("templateAnio");
             elem.addClass("anioClass");
             elem.attr("value", cont);
             $(".templateAnio").before(elem);
             cont = cont + 1;
            });

           
        },
        error: function() {
            alert("Error al cargar las asignaturas");
        }


    });
}

function parserFecha(f){
    var fecha = new Date(f);
    fecha = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
    return fecha;
}

function cargarTablaEjercicios(idAsignatura, textAnio){

    $.ajax({
        method: "GET",
        url: "/getTablaEjerciciosAtrasados",
        contentType: "application/json",
        data:{idA:idAsignatura, anio:textAnio},
        success: function(data) {
            data.forEach(e=>{
                var elem = $("#template").clone();
                elem.find("#titulo").text(e.titulo);
                elem.find("#autor").text(e.autor);
                elem.find("#id").text(e.idEj);
                elem.find("#fecha").text(parserFecha(e.fecha));
                elem.removeClass("hidden");
                elem.removeAttr("id", "template");
                elem.attr("class", "elem");
                //elem.data("idEj", e.idEj);
                $("#template").before(elem);
           });
           var table = $('#tablaDeEjercicios').DataTable();
           
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