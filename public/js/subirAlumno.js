$(document).ready(function() { 
    $("#desconectar").removeClass("hidden");
    $("#desconectar").click(function(event) {
        $.galleta().setc("usuario", "undefined", "Thu, 01 Jan 1970 00:00:01 GMT");
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    });
    var options={}
    $.galleta(options);
    var user = $.galleta().getc("usuario");
    if(user !== "undefined"){
        user = JSON.parse(user);
        $("#solProf").attr("disabled", true);
        $("#botonPdf").click(function(event){
            event.preventDefault();
   
            var doc = $("#botonPdf").attr("href");
   
            var htmlText = '<iframe width=100% height=100%'
                         + ' type="application/pdf"'
                         + ' src="'
                         + encodeURI(doc)
                         + '"></iframe>';
            // Open PDF in new browser window
            var detailWindow = window.open ("");
            detailWindow.document.write(htmlText);
            detailWindow.document.close();
        });
        //subirAlumno
        //cargarProblemaAlumno();
        $("#evaluar").click(function(event) {//Dale al boton y deberia de ejecutarse la funcion 
            ///PROGRAMAR FUNCIONES
            event.preventDefault();
            console.log("boton pulsado");
            alert($("solProf").val());
        });
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
 });
 

 function subirScriptlumno(user){
    alert("hola");
    var link = window.location.href;
    var res = link.split("/");
    let idEjercicio = link[link.length-1];//coger del id
    alert(idEjercicio);
    let solucion = $("procedimientoAlumno").val();
    //let nota
    //let numOk
    let entregaRetrasada = new Date();
    console.log(entregaRetrasada);
    /*$("procedimientoAlumno").val()){
        let correccionProfesor =
    }*/
    let idAlumno = user.idAlumno;
    let idGrupo = user.idGrupo;
    //let intentos
    let resultado = NULL; //se tiene que coger del oracledb
    let fechaActual = new Date();

    const reader = new FileReader();
    reader = $('input[type=file]')[0].files[0];
    if(reader.EMPTY){
        info = {scripts: archivosTo64, enun:enun64, tablas: tablas64, solucion: solucion64, titu:titulo, idProfesor:user.idProfesor};
        $.ajax({
            method: "POST",
            url: "/subirEjercicio",
            data: JSON.stringify(info),
            dataType:"JSON",
            contentType: "application/json",
            success: function() {
                alert("se ha subido correctamente el ejercicio");
                var link = window.location.href;
                var res = link.split("/");
                window.location = res[1] + "/principal.html";
            },
            error: function() {
                alert("Error al subir un nuevo ejercicio.");
            } 
        });
    }else{
        alert("la");
    }
    
    
 }
 
 