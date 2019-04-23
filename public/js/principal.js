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

        crearAlumno(user);
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }   
    
});
function crearAlumno(alumno) {
    let alumnoAux={};
    alumnoAux.nombre= alumno.nombre;
    alumnoAux.idAlumno= alumno.idAlumno;
    alumnoAux.usuario = alumno.user;
    console.log(alumnoAux);
    $.ajax({
        method: "POST",
        url: "/crearAlumno",
        contentType: "application/json",
        data: JSON.stringify({alumnoAux:alumnoAux}),
        success: function() {
            alert("Alumno creado correctamente.");
        },
        error: function() {
            alert("Error al crear el alumno ORACLEDB.");
        }
    })
}

function crearAlumno(){
    let nombre = user.nombre;
    let idAlumno = user.idAlumno;
    console.log(" crearAlumno();   ");
    $.ajax({
        method: "POST",
        url: "/crearAlumno",
        contentType: "application/json",
        data: JSON.stringify({nombre:nombre,idAlumno:idAlumno}),
        success: function(data) {
            alert("Usuario creado corectamente.");
        },
        error: function() {
            alert("Error al crear usuario.");
        }
    })
}
function cargarTabla(type) {
    $.ajax({
        method: "POST",
        url: "/principal",
        contentType: "application/json",
        data: JSON.stringify({tipo:type}),
        success: function(data) {

            var tabla   = document.getElementsByTagName("table")[type];
            var tblBody = document.createElement("tbody");
            for(var i=0; i<data.length; i++){
                var hilera = document.createElement("tr");
                var celda = document.createElement("td");
                var link = document.createElement('a');
                var url = "/subirAlumno/" + data[i].id + "/" + user.idAlumno;
                link.setAttribute('href', url);
                link.setAttribute('class',"linkEjercicio");
               
                var textoCelda = document.createTextNode(data[i].titulo +" "+"ID:"+ " "+data[i].id);
                link.appendChild(textoCelda)
                celda.appendChild(link);
                hilera.appendChild(celda);
                tblBody.appendChild(hilera);
            }
            tabla.appendChild(tblBody);
        },
        error: function() {
            alert("Error al cargar tabla.");
        }
    })
}


function addID(id){
    $.ajax({
        method: "GET",
        url: "/principal/"+id,
        success: function(data) {
            
        },
        error: function() {
            alert("Error al añadir ID");
        }
    })
}





