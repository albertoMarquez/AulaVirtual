

//subir ejercicio profesor
var enun;
var tablas;
var solucion;
var titulo;
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
    //scripts();
    //alert("HOLA");
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
        console.log(user);
    
       
        $("#file-5").fileinput({
            uploadUrl: "/scripts",
            allowedFileExtensions: ["sql", "txt"],
            maxFileCount: 5
        });
    
        $("#formInput").on("submit", function(e){
            e.preventDefault();
           // var formData = new FormData($(this).get(0)); // Creating a formData using the form.
    
           var archivos = $('input[type=file]')[3].files;
    
           var archivosTo64 = [];
           var file = {};
           var cont = 1;
           
            for(var i = 0; i < archivos.length; i++){
                getBase64(archivos[i]).then(file64 =>{
                    file.archivo = file64;
                    file.id = cont;
                    cont = cont + 1;
                    archivosTo64.push(file);
                    file = {};
                });
            }
            nuevoEjercicio(archivosTo64);
           
        });
        
        $(function() {
            bs_input_file();
        });
    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
    
});

function bs_input_file() {
    $(".input-file").before(
        function() {
            if ( ! $(this).prev().hasClass('input-ghost') ) {
                var element = $("<input type='file' class='input-ghost' style='visibility:hidden; height:0'>");
                element.attr("name",$(this).attr("name"));
                element.change(function(){
                    element.next(element).find('input').val((element.val()).split('\\').pop());
                });
                $(this).find("button.btn-choose").click(function(){
                    element.click();
                });
                $(this).find("button.btn-reset").click(function(){
                    element.val(null);
                    $(this).parents(".input-file").find('input').val('');
                });
                $(this).find('input').css("cursor","pointer");
                $(this).find('input').mousedown(function() {
                    $(this).parents('.input-file').prev().click();
                    return false;
                });
                return element;
            }
        }
    );
}
//Implementando
function nuevoEjercicio(archivosTo64) {
    enun = $('input[type=file]')[0].files[0];
    tablas = $('input[type=file]')[1].files[0];
    solucion = $('input[type=file]')[2].files[0];
    titulo = $('#tituloProblema').val();

    
        getBase64(tablas).then(tablas =>{
            var tablas64 = tablas;
            getBase64(solucion).then(sol =>{
                var solucion64 = sol;
                getBase64(enun).then(data => {
                    var enun64 = data;
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
                });
                
            });
        }
    );   
}


function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
}


