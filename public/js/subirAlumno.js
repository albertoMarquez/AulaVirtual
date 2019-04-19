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
      
        $.ajax({
            method: "GET",
            url: "/subirAlumno/:id",
            data: {idAlumno: user.idAlumno, idProfesor: user.idProfesor},
            contentType: "application/json",
            success: function(){
               console.log("ok");
            },
            error: function() {
               console.log("error al cargar el id del usuario");
            } 
        });

    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }



 });
 
 //coge el numero de intentos totales de altaEjercicio
 function numeroDeIntentos(idEjercicio, callback){
        let idEj = idEjercicio;
        $.ajax({
            method: "POST",
            url: "/numeroDeIntentos",
            data: JSON.stringify({idEjercicio: idEj}),
            dataType:"JSON",
            contentType: "application/json",
            success: function(nIntentos){
                //console.log(numeroDeIntentos);
                callback(nIntentos);
            },
            error: function() {
                alert("Error numeroDeIntentos");
            } 
        });
 }

 function subirScriptAlumno(user, idEjercicio){
    //alert("hola");
    
    let solucion = $("#solAlmun").val();
    let numOk = 0;//coger resultado de oracledb
    let entregaRetrasada = new Date();
    //console.log(entregaRetrasada);
    /*let correccionProfesor="";
    if($("#solProf").val() !== undefined)
        correccionProfesor = $("#solProf").val();*/
    let idAlumno = user.idAlumno;
    let idGrupo = user.idGrupo;
    let intentos = 0;
    numeroDeIntentos(idEjercicio, (num)=>{
        //get intentos alumno, comparar y si es menor, sumar 1 y
        //actualizar tabla
        getIntentosAlumno(idEjercicio, idAlumno, (numIntentos)=>{
           // console.log("numIntentos del alumno " + numIntentos.intentos);
           // console.log("numTotales " + num);
            if(/*numIntentos.intentos < num*/true){
                let resultado = ""; //se tiene que coger del oracledb
                let fechaActual = new Date();
                let nombre = user.nombre;
                let usuario = user.user;
                intentos = numIntentos + 1;
                leerArchivo((contenido)=>{
                    //console.log(user.user);
                    //if(true){//reader.EMPTY){
                    let solucion2 = contenido;
                    var info = {};
                    if(solucion === ""){
                        if(solucion2 === undefined){
                            alert("sube una solucion");
                        }else{
                            info = {idEjercicio:idEjercicio, nombre:nombre, usuario:usuario, numOk: numOk, entregaRetrasada: entregaRetrasada, idAlumno:idAlumno, idGrupo:idGrupo,intentos:intentos,resultado:resultado,fechaActual:fechaActual,solucion:solucion2};
                        }
                    }else{
                        info = {idEjercicio:idEjercicio, nombre:nombre, usuario:usuario, numOk: numOk, entregaRetrasada: entregaRetrasada, idAlumno:idAlumno, idGrupo:idGrupo,intentos:intentos,resultado:resultado,fechaActual:fechaActual,solucion:solucion};
                    }
                       console.log("info");
                       //console.log(info);
                    $.ajax({
                        method: "POST",
                        url: "/crearAlumno",
                        data: JSON.stringify(info),
                        dataType:"JSON",
                        contentType: "application/json",
                        success: function() {
                            alert("ajax 2 ejecutar procedimiento");
                            $.ajax({
                                method: "POST",
                                url: "/ejecutarProcedimientoAlumno",
                                contentType: "application/json",
                                success: function(){
                                    alert("el procedimiento del alumno se ha ejecutado correctamente");
                                },
                                error: function(){
                                    alert("error en ejecutar el procedimiento del alumno");
                                }
                            })
                        },
                        error: function() {
                            alert("Error al subir un nuevo ejercicio. :(");
                        } 
                    });
                });
            }else{
                alert("Numero de intentos superado");
            }
            
        });

    });
 }
 
function getIntentosAlumno(idEjercicio, idAlumno, callback){
    var sol = {};
    sol.idEjercicio = idEjercicio;
    sol.idA = idAlumno;
    $.ajax({
        method: "GET",
        url: "/getIntentosAlumno",
        data: sol,
        dataType:"JSON",
        contentType: "application/json",
        success: function(numIntentos) {
            callback(numIntentos);
        },
        error: function(){
            alert("error al cargar el numero de intentos del alumno");
        }
    });
}

function leerArchivo(callback) {
    var archivo = $('input[type=file]')[0].files[0];
    console.log("archivo");
    console.log(archivo);
    if (!archivo) {
        callback(undefined);
    }else{
        var lector = new FileReader();
        lector.onload = function(e) {
          var contenido = e.target.result;
          callback(contenido);
        };
        lector.readAsText(archivo);
    }
}


  