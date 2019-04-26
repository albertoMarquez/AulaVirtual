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
    
        $.ajax({
            method: "GET",
            url: "/mostrarListaEjer",
            contentType: "application/json",
            success: function(data) {
               data.forEach(e => {
                   
                var elem = $("#template").clone();
                elem.find("#titulo").text(e.titulo);
                elem.find("#numScripts").text(e.numScripts);
                elem.find("#autor").text(e.autor);
                elem.find("#alta").text(e.alta);
                elem.find("#curso").text(e.curso);
                elem.find("#grupo").text(e.grupo);
                elem.find("#asignatura").text(e.asignatura);
                elem.removeClass("hidden");
                elem.attr("id", "elem");
                $("#template").before(elem);
               });
               $('#tablaEjercicios').DataTable();
               $('.dataTables_length').addClass('bs-select');
            },
            error: function() {
                alert("Error al mostrar los ejercicios");
            }
        });
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
    


    
});