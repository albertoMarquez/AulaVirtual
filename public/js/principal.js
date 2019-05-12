//import { json } from "body-parser";

var examenes=0;
var ejercicios =0;
var user;
$(document).ready(function() {
    ////////////////////////////
    //var idEj= 8;
    //cargarEjercicio(idEj.toString());
    ////////////////////////////
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
        if( user.user.localeCompare("profesor")===0){
            $("#menu").load("menuProfesor.html");
            $(".ejs_ex").addClass("hidden");
        }else if(user.user.localeCompare("alumno")===0){
            $("#menu").load("menuAlumno.html");
        }
        
        $(".parrafoExamenes").hide();
        $(".parrafoEjercicios").hide();
     
        
        $("#Ejercicios").click(function(event) {
            event.preventDefault();
            $(".parrafoEjercicios").show();
            $("#tablaEjercicios").show();
            $("#tablaEjercicios tbody").remove();
            $(".parrafoExamenes").hide();
            $("#tablaExamenes").hide();
            cargarTabla(0);
        });
    
        $("#Examenes").click(function(event) {
            event.preventDefault();
            $(".parrafoExamenes").show();
            $("#tablaExamenes").show();
            $("#tablaExamenes tbody").remove();
            $(".parrafoEjercicios").hide();
            $("#tablaEjercicios").hide();
            cargarTabla(1);
        });

        
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }   
    
});

function cargarTabla(type) {
    
    $.ajax({
        method: "POST",
        url: "/principal",
        contentType: "application/json",
        data: JSON.stringify({tipo:type, id:user.idAlumno}),
        success: function(data) {
            
            var tabla   = document.getElementsByTagName("table")[type];
            var tblBody = document.createElement("tbody");
            for(var i=0; i<data.length; i++){
                var hilera = document.createElement("tr");
                var titulo = document.createElement("td");
                var texto = document.createTextNode(data[i].titulo);
                titulo.appendChild(texto);
                var id = document.createElement("td");
                var textoId = document.createTextNode(data[i].id);
                id.appendChild(textoId);
               
                var link = document.createElement('a');
                var linkId = document.createElement('a');
                var url = "/subirAlumno/" + data[i].id + "/" + user.idAlumno;
                link.setAttribute('href', url);
                linkId.setAttribute('href', url);

        
                link.appendChild(texto);
                titulo.appendChild(link);
                linkId.appendChild(textoId);
                id.appendChild(linkId);

                hilera.appendChild(titulo);
                hilera.appendChild(id);
                tblBody.appendChild(hilera);
            }
            tabla.appendChild(tblBody);

           // $('#tablaEjercicios').DataTable();
           // $('#tablaExamenes').DataTable();

           
        },
        error: function() {
            alert("Error al cargar tabla.");
        }
    })
}






