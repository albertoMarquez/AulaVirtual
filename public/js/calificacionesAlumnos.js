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
       
        cargarNotas(Number(user.idAlumno));
    }
    else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
});

//se da por supuesto que el idA y el idG pertenecen al profesor logueado
//por lo que en la query no hace falta dicha comprobación
function cargarNotas(idAlumno){
    
    $.ajax({
        method: "GET",
        url: "/notasAlumno",
        contentType: "application/json",
        data: {idAlumno: idAlumno},
        success: function(data) {
            // modal.style.display = "none";
            console.log("Notas"); 
            console.log(data); 
            //console.log(data);
            //$('#tablaN').DataTable().clear().destroy();

            var el = $("<tr>").attr("id", "plantilla");
            el.addClass("hidden");
            row = $("<td>").attr("id", "idEjercicio");
            el.append(row);
            var row = $("<td>").attr("id", "titulo");
            el.append(row);
            row = $("<td>").attr("id", "nota");
            el.append(row);
            
            $("tbody").append(el);

            data.forEach(e => { 

                var a = $("#plantilla").clone();
               
                
                a.find("#idEjercicio").text(e.idEjercicio);
                a.find("#titulo").text(e.titulo);
                a.find("#nota").text(e.nota);

                a.attr("id", "");
                a.removeClass("hidden");
                a.attr("class", "elem");
                $("tbody").before(a);
            });
            
        },
        error: function(){
            alert("Error al actualizar");
        }
    });
}