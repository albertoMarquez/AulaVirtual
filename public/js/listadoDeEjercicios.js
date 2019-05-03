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
    var user = $.galleta().getc("usuario");
    if(user !== "undefined"){
        user = JSON.parse(user);

    
        if( user.user.localeCompare("profesor")===0){
            $("#menu").load("menuProfesor.html");
        }else if(user.user.localeCompare("alumno")===0){
            $("#menu").load("menuAlumno.html");
        }
       

        listarAsignaturas();

        $('#asig').on('change', function() {
            let valor = $(this).find(':selected').data('idAsig');
            //console.log(valor);
            listarAnios(valor);
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
        url: "/getAsignaturas",
        contentType: "application/json",
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
             elem.text(e);
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