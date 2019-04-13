var user;
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
    user = $.galleta().getc("usuario");
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
            var link = window.location.href;
            var res = link.split("/");
            let idEjercicio = res[res.length-1];//coger del id
            /*numeroDeIntentos(idEjercicio, (num)=>{//¿PORQUE NO FUNCIONA EL ALERT?
                console.log("num de intentos"+num);
            });*/
            //document.getElementById("myTextarea").value;
            //let solucion = $("#solAlmun").val();
            //console.log(user.idAlumno);
            subirScriptAlumno(user, idEjercicio);
        });
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
 });
 
 function numeroDeIntentos(idEjercicio, callback){
        let idEj = idEjercicio;
        info = {idEjercicio: idEj};
        $.ajax({
            method: "POST",
            url: "/numeroDeIntentos",
            data: JSON.stringify(info),
            dataType:"JSON",
            contentType: "application/json",
            success: function(numeroDeIntentos){
                //console.log(numeroDeIntentos);
                callback(numeroDeIntentos);
            },
            error: function() {
                alert("Error numeroDeIntentos");
            } 
        });
 }
 function subirScriptAlumno(user, idEjercicio){
    //alert("hola");
    
    let solucion = $("#solAlmun").val();
    let nota =0;//coger la nota de la BD
    let numOk = 0;//coger resultado de oracledb
    let entregaRetrasada = new Date();
    //console.log(entregaRetrasada);
    let correccionProfesor="";
    if($("#solProf").val() !== undefined)
        correccionProfesor = $("#solProf").val();
    let idAlumno = user.idAlumno;
    let idGrupo = user.idGrupo;
    let intentos = 0;
    /*numeroDeIntentos(idEjercicio, (num)=>{
        
    });*/
    let resultado = ""; //se tiene que coger del oracledb
    let fechaActual = new Date();

    let nombre = user.nombre;
    let usuario = user.user;
    const solucion2 = new FileReader();
    //solucion2 = $('input[type=file]')[0].files[0];
    //console.log(user.user);
    //if(true){//reader.EMPTY){
        info = {nombre:nombre,solucion: solucion,usuario:usuario,idEjercicio:idEjercicio, nota:nota, numOk: numOk, entregaRetrasada: entregaRetrasada, correccionProfesor:correccionProfesor, idAlumno:idAlumno, idGrupo:idGrupo,intentos:intentos,resultado:resultado,fechaActual:fechaActual,solucion2:solucion2};
        console.log(info.user);
        $.ajax({
            method: "POST",
            url: "/subirProcedimientoAlumno",
            data: JSON.stringify(info),
            dataType:"JSON",
            contentType: "application/json",
            success: function() {
                alert("se ha subido correctamente el ejercicio");
                /*var link = window.location.href;
                var res = link.split("/");
                window.location = res[1] + "/principal.html";*/
            },
            error: function() {
                console.log("Error al subir un nuevo ejercicio.");
            } 
        });
    /*}else{
        alert("la");
    }*/
    
    
 }
 
 