//falta arreglar todo desde aqui
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
    var options={}
    $.galleta(options);
    user = $.galleta().getc("usuario");
    if(user !== "undefined"){
        user = JSON.parse(user);

    
        if( user.user.localeCompare("profesor")===0){
            $("#menu").load("menuProfesor.html");
        }else if(user.user.localeCompare("alumno")===0){
            $("#menu").load("menuAlumno.html");
        }
    
        $.ajax({
            method: "GET",
            url: "/evaluaAlumno",
            contentType: "application/json",
            data: {id:user.idProfesor},
            success: function(data) {

                data.forEach(e => {
                   
                var elem = $("#template").clone();
                elem.find("#nombre").text(e.nombre);
                elem.find("#apellidos").text(e.apellidos);
                elem.find("#idEjer").text(e.idEjer);
                elem.find("#titulo").text(e.titulo);
                elem.find("#numScriptsOK").text(e.numScriptsOK);
                elem.find("#numsScriptsTotales").text(e.numScriptsTotales);
                elem.find("#entregaRetrasada").text(e.entregaRetrasada);
                elem.find("#cursoGrupo").text(e.cursoGrupo);
                elem.find("#intentos").text(e.intentos);
                elem.find("#resultado").text(e.resultado);
                elem.find("#nota").text(e.nota);

                elem.removeClass("hidden");
                elem.attr("id", "elem");
                $("#template").before(elem);
               });
               $('#tablaA').DataTable();
               var table = $('#tablaA').DataTable();
               $('.dataTables_length').addClass('bs-select');
               // el orden de la tabla lo he sacado de aqui https://mdbootstrap.com/docs/jquery/tables/sort/ 
               $('#tablaA').on('click', 'tbody tr', function(){
                  // console.log('TR cell textContent : ', this);
                  var data = table.row( this ).data();
                 abrirModal(data);
                
               });
            },
            error: function() {
                alert("Error al mostrar los ejercicios");
            }
        });
    }
    else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }

   
    
});



function abrirModal(data){
    // Get the modal
    var modal = document.getElementById('myModal');

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

   
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}