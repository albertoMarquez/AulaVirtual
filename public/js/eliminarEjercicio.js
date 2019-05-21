var user;
$(document).ready(function() {
    var options={}
    $.galleta(options);
    user = $.galleta().getc("usuario");
    
    if(user != "undefined"){
        user = JSON.parse(user);
        $("#cabecera").load("cabecera.html",function(responseTxt, statusTxt, xhr){
            if(statusTxt == "success"){
                $("#nombre_usuario").text(user.nombre);
                $("#roll_usuario").text(user.user + " :");
                if( user.user.localeCompare("profesor")===0){
                    $("#menu").load("menuProfesor.html");
                    $(".ejs_ex").addClass("hidden");
                    $("#aYG").addClass("hidden");
                }else if(user.user.localeCompare("alumno")===0){
                    $("#menu").load("menuAlumno.html");
                    $("#aYG_usuario").text(user.descripcion +" "+user.curso+"º"+user.grupo);
                }
                $("#desconectar").click(function(event) {
                    $.galleta().setc("usuario", "undefined", "Thu, 01 Jan 1970 00:00:01 GMT");
                    var link = window.location.href;
                    var res = link.split("/");
                    window.location = res[1] + "/";
                });
            }  
        });
        
        mostrarListaEjerciciosNoAsignados();

        $('#tablaA').on('click', 'tbody tr', function(){
            // console.log('TR cell textContent : ', this);
            var data = tableData.row( this ).data();
            console.log(data[0]);
            $.ajax({
                method: "POST",
                url: "/eliminarEjercicio",
                contentType: "application/json",
                data: JSON.stringify({idEjercicio: data[0]}),
                success: function() {
                    location.reload();
                },
                error: function() {
                    alert("Error al eliminar el ejercicio");
                }
            });

        }); 

    }else{
        var link = window.location.href;
        var res = link.split("/");
        window.location = res[1] + "/";
    }
    
});

function mostrarListaEjerciciosNoAsignados(){
   
    $.ajax({
        method: "GET",
        url: "/mostrarListaEjerNoAsignados",
        contentType: "application/json",
        data: {},
        success: function(data) {
            
            $('#tablaA').DataTable().clear().destroy();

            var el = $("<tr>").attr("id", "template");
            el.addClass("hidden");
            var row = $("<td>").attr("id", "idEjercicio");
            el.append(row);
            row = $("<td>").attr("id", "Titulo");
            el.append(row);
           
            $("tbody").append(el);

           data.forEach(e => {
            var elem = $("#template").clone();
            elem.find("#idEjercicio").text(e.idEjercicio);
            elem.find("#Titulo").text(e.titulo);
            elem.attr("id", "");
            elem.removeClass("hidden");
            elem.attr("class", "elem");
            $("#template").before(elem);
           
           });
           tableData = $('#tablaA').DataTable({
            "oLanguage": {
                "sSearch": "Filtro de búsqueda:",
                "sEmptyTable": "No hay datos para mostrar",
                "sInfo": "Hay un total de _TOTAL_ resultados a mostrar (_START_ a _END_)",
                "sInfoEmpty": "No hay entradas a mostrar",
                "sLengthMenu": "Mostrando _MENU_ resultados"
            }
        });
            
        $('.dataTables_length').addClass('bs-select');
        // el orden de la tabla lo he sacado de aqui https://mdbootstrap.com/docs/jquery/tables/sort/ 
           
        },
        error: function() {
            alert("Error al mostrar los ejercicios");
        }
    });

}