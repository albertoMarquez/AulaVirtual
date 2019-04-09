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
            if(entregaRetrasada(19))
                console.log("Retrasada");
        });
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
 });
 /* var x = new Date('2013-05-23');
        var y = new Date('2013-05-23');

        // less than, greater than is fine:
        x < y; => false
        x > y; => false
        x === y; => false, oops!

        // anything involving '=' should use the '+' prefix
        // it will then compare the dates' millisecond values
        +x <= +y;  => true
        +x >= +y;  => true
        +x === +y; => true*/
 function entregaRetrasada(idEjercicio){
    let fechaSubida = new Date();
    //let idEj = idEjercicio;
    info = {idEjercicio: idEjercicio};
    $.ajax({
        method: "POST",
        url: "/entregaRetrasada",
        data: JSON.stringify(info),
        dataType:"JSON",
        contentType: "application/json",
        success: function(fechaFin) {
            if(fechaSubida > fechaFin)
                alert("Fecha retrasada");
            return fechaSubida > fechaFin;
        },
        error: function() {
            alert("Error al comprobar la fecha de entrega");
        } 
    });
 }

 function subirScriptlumno(user){
    alert("hola");
    var link = window.location.href;
    var res = link.split("/");
    let idEjercicio = link[link.length-1];//coger del id
    alert(idEjercicio);
    let solucion = $("procedimientoAlumno").val();
    //let nota
    //let numOk
    //let entregaRetrasada = entregaRetrasada(idEjercicio);
    let correccionProfesor
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
 
 