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
    //alert(getCookie("usuario").toString());
    var options={}
    $.galleta(options);
    user = $.galleta().getc("usuario");
    if(user !== "undefined"){
        user = JSON.parse(user);

        //alert(user);
        if( user.user.localeCompare("profesor")===0){
            $("#menu").load("menuProfesor.html");
        }else if(user.user.localeCompare("alumno")===0){
            $("#menu").load("menuAlumno.html");
        }
        $("#subir").click(function(event) {
            event.preventDefault();
            cargarAlumnos();
        });
      
       
        cargarCursoYGrupo();
    }
    else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }


    //$("#cursoYGrupo").load("aniadirCursoyGrupo.html");
    //IMPLEMENTAR
    /*$("#cargarCursoYGrupo").click(function(event) {
        event.preventDefault();
        cargarCursoYGrupo();
    });*/
   
});

function cargarCursoYGrupo(){
    $.ajax({
        method: "GET",
        url: "/cargarCursoYGrupo",
        contentType: "application/json",
        data: {idProfesor:user.idProfesor},
        success: function(data){
            //alert("se han cargado correctamente");
            data.sort;
            data.forEach(e => {
                //optionG.text = e.grupo.toString();
                $('#cargarCursoYGrupo').append($('<option>', {
                    value: e.idGrupo,
                    text:  e.curso +"º "+ e.grupo + " - " +e.anio
                }));
            });
        },
        error: function() {
            alert("Error al cargar el curso y grupo.");
        }
    }) 
}

function readFile(scriptAlumnos, onLoadCallback){
    var sol;
    var f = document.getElementById(scriptAlumnos).files;
    if (!f.length) {
      alert('Please select a file!');
      return;
    }
    var reader = new FileReader();
    reader.onload = onLoadCallback;
    reader.readAsText(f[0]);
}  

function cargarAlumnos(){
    var alumnos ;
    var cursoYGrupo = $( "#cargarCursoYGrupo" ).val();
    if($('input[type=file]')[0].files[0]){
        readFile('scriptAlumnos',function(e){
            alumnos= e.target.result;
            $.ajax({
                method: "POST",
                url: "/scriptAlumnos",
                contentType: "application/json",
                data: JSON.stringify({  cursoYGrupo: cursoYGrupo, script: alumnos,idProfesor:user.idProfesor}),
                success: function(data){
                    alert("se han cargado correctamente los alumnos");
                    var link = window.location.href;
                    var res = link.split("/");
                    window.location = res[1] + "/principal.html";
                },
                error: function() {
                    alert("Error al cargar los alumnos.");
                }
            })
        });
    }
    else{
        alert("Asegurese de haber subido un archivo");
    }
}
