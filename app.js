const express = require("express");
const path = require("path");
const mysql = require("mysql");
const oracleProfesor = require("./oracleProfesor");
const oracleAlumno = require("./oracleAlumno");
//const oracleProcedure = require("./conectionOracleProcedure.js");
const config = require("./config");
const bodyParser = require("body-parser");

const diff = require("diff");

const daoUser = require("./daos/daoUser");
const daoEjer = require("./daos/daoEjercicio");
const daoAsig = require("./daos/daoAsignatura");

var passport = require("passport");
var passportHTTP = require("passport-http");
const expressValidator = require("express-validator");

var fs = require("fs");
const app = express();
//const upload = multer({ storage: multer.memoryStorage() });
let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

let daoU = new daoUser.DAOUsers(pool);
let daoE = new daoEjer.DAOEjercicio(pool);
let daoA = new daoAsig.DAOAsignatura(pool);
//let daoO = new daoOracle.DAOOracle(connection);
/*const clavePrivada = fs.readFileSync(path.join(__dirname, "mi_clave.pem"));
const certificado = fs.readFileSync(path.join(__dirname, "certificado_firmado.crt"));*/

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
let usuario;


app.get("/", (request, response) => {
    response.status(200);
    response.redirect("/index.html");
});

app.get("/getId", (request, response) => {
    daoU.getId(request.query.login, request.query.password, (err, result) => {
        if (err) {
            response.status(400);
            response.end();
        } else {
            response.json(result);
        }
    })
    
});
//import Cookie from "./public/js/cookie";
app.post("/login", (request, response) => {
    daoU.isAlumno(request.body.login, request.body.password, (err, op, alumno) =>{
        if (err){
            response.status(400); //mal introducido
            response.end();
        }
        else {
            if (op === false) { // el alumno no existe
                daoU.isProfesor(request.body.login, request.body.password, (err, op, profesor) =>{
                    if(err){ // mal introducido
                        response.status(400);
                        response.end();
                    }else{
                        if(op === false){ //el profesor no existe
                            response.status(400);
                            response.end(); 
                        }
                        else{ //es profesor
                            //console.log("profesor:  "+profesor);
                            response.json(profesor);
                            response.status(201); //el usuario es correcto
                            response.end();
                        }
                    }
                })
            } 
            else {
                
                response.json(alumno);
                //oracle.connect(oracle.run);
                response.status(201); //el alumno es correcto
                response.end();
            }
        }
    });
});

app.post("/logout", (request, response) =>{
    response.status(200);
    response.end(); // se ha podido desconectar de manera exitosa
});

app.post("/cambiarpass", (request, response) =>{
    console.log("request");
    console.log(request);
    console.log("request.body.pass1");
    console.log(request.body.pass1);
    console.log("request.body.pass2");
    console.log(request.body.pass2);
   if(request.body.pass1 === request.body.pass2){
        daoU.cambiarpass(request.body.user, request.body.pass1, request.body.date, (err) =>{
           if(!err){
               response.status(200);
               response.end();
           }else{
               response.status(400);
               response.end();
            }    
        });
   }else{
       response.status(400);
       response.end();
   }
});

app.post("/nuevoUser", (request, response) =>{
    //console.log(request.body);
    daoU.isUserCorrect(request.body.correo, (err, op) =>{
        if (err){
            response.status(400); //mal introducido
            response.end();
        }
        else {
            if(op === false){ //el usuario no existe
                daoU.createProfesor(request.body, (err, id) =>{
                    if(err) {
                        response.status(400);
                        response.end();
                    }
                    else {
                        response.status(201);
                        response.end();
                    }
                })
            }
            else{
                response.status(400); //el usuario ya existe
                response.end();
            }
        }
    });
});

app.post("/scriptAlumnos",(request, response) =>{
   //console.log(request.body);
    daoU.cargarAlumnos(request.body,(err, op) =>{
        if (err){
            response.status(400); //mal introducido
            response.end();
        }
        else {
            response.status(201);
            response.end();
        }
    });
});

app.post("/crearCursoYGrupo",(request, response) =>{
    daoU.crearCursoYGrupo(request.body,(err, op) =>{
        if (err){
            response.status(400); //mal introducido
            response.end();
        }
        else {
            response.status(201);
            response.end();
        }
    });
});

app.post("/eliminarCursoYGrupo",(request, response) =>{
    daoU.eliminarCursoYGrupo(request.body,(err, op) =>{
        if (err){
            response.status(400); //mal introducido
            response.end();
        }
        else {
            response.status(201);
            response.end();
        }
    });
 });

 app.get("/cargarCursoYGrupo",(request, response) =>{
    daoU.cargarCursoYGrupo(request.query,(err, op) =>{
        if (err){
            response.status(400); //mal introducido
            response.end();
        }else {
            if(op !== undefined){
                //console.log(op);
                response.json(op);
                response.status(201);
                response.end();
            }
        }
    });
 });

app.post("/altaEjercicio", (request, response) =>{

    var fechaIni = request.body.ejer.ini.split("/");
    var fechaFin = request.body.ejer.fin.split("/");

    var dia = Number(fechaIni[1]);
    var mes = Number(fechaIni[0]) - 1;
    var año = Number(fechaIni[2]);

    var datos={};
    datos.ini = new Date(año, mes, dia);
    dia = Number(fechaFin[1]);
    mes = Number(fechaFin[0]) - 1;
    año = Number(fechaFin[2]);
    datos.fin = new Date(año, mes, dia);
    datos.idGrupo = request.body.ejer.idGrupo;
    datos.idEj = request.body.ejer.idEjercicio;
    datos.evaluacion = Number(request.body.ejer.examen);
    datos.numIntentos = request.body.ejer.numIntentos;

    daoE.altaEjercicio(datos, (err, filas) =>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.status(201);
            response.end();
        }
    })     
});


app.post("/principal", (request, response) =>{
    //console.log(request.body); terminal code
    // oracle.alerta();
    
    daoE.listarEjerciciosAlta(request.body.tipo, (err, op) =>{
        if(err) {
            response.status(400);
            response.end();
        }
        else {
            if(op !== undefined){
               
                response.json(op);
                response.status(201);
                response.end();
            }           
        }
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
/*app.post("/principal", (request, response) =>{
    console.log("dentro de app");
    daoE.descargarProfesor(request.body.id, (err, op) =>{
        if(err) {
            response.status(400);
            response.end();
        }
        else {
            if(op !== undefined){
                response.json(op);
                //oracle.connect(oracle.run,op);
                //oracleProcedure.createPool;
                //console.log(reemplazar(op));
                response.status(201);
                response.end();
            }
        }
    });
});*/
//////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/getEjercicios", (request, response) =>{
    daoE.listarEjerciciosNoAlta((err, ejs) =>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.status(200);
            response.json(ejs);
            response.end();
        }
    })

});

app.get("/getAsignaturas", (request, response) =>{
    daoA.listarAsignaturas((err, filas) =>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.status(200);
            response.json(filas);
            response.end();
        }
    })
});

app.post("/subirEjercicio", (request, response) =>{
    var data = {};
    data.enun = request.body.enun;
    data.sol = request.body.solucion;
    data.tablas = request.body.tablas;
    data.titulo = request.body.titu;
    data.idProfesor = request.body.idProfesor;
    data.numScripts = request.body.scripts.length;
    data.usuario= request.body.usuario;
    //data.idAlumno =request.body.idProfesor;//casteo para tratar al alumno y al profesor en oracleProfesor

    daoE.createEjercicio(data, (err, id) =>{
        if(err){
            response.status(400);
            response.end();
        }else{
            daoE.subirScripts(request.body.scripts, id, (err) =>{
                if(err){
                    response.status(400);
                    response.end();
                }else{
                    daoE.descargarProfesor(id, (err, op) =>{
                        if(err){
                            response.status(400);
                            response.end();
                        }else{
                            if(op !== undefined){
                                response.json(op);
                                console.log(data.usuario);
                                let user = "P"+data.usuario.toUpperCase()+data.idProfesor.toString();
                                oracleProfesor.altaUsuario(user,(resul)=>{
                                    oracleProfesor.connectProfesor(op,user,(sol)=>{
                                        daoE.solScripts(id,sol,(err, op)=>{
                                            if(err){
                                                response.status(400);
                                                response.end();
                                            }else {
                                                if(op !== undefined){
                                                    response.status(201);
                                                    response.end();
                                                }
                                            }
                                        });
                                    });
                                });
                                response.status(201);
                                response.end();
                            }
                        }
                    });
                }
            });
        }
    });
});


function highlight(newElem, oldElem){ 

    var text = "";
    if(newElem === undefined || oldElem === undefined){
        text = "<span>No tienes comentarios</span>";
    }else{
        var d = diff.diffWordsWithSpace(oldElem, newElem);
        d.forEach(elem =>{
         
            if(elem.value === '\n' || elem.value === '\r\n' || elem.value === '\r\n \r\n' || 
            elem.value === '\r\n  ' || elem.value === '\n \n' || elem.value === '\n    ' ||
            elem.value === '\r\n    ' || elem.value === '\n  ' || elem.value === '\n  ' || 
            elem.value === '\r\n  ' || elem.value === '\r\n\r\n' || elem.value === '\n \n  ' ||
            elem.value === '\n  \n    ' || elem.value === '\r\n       \t' || elem.value === '\r\n            ' ||
            elem.value === '\n\n    '){
                text += "<br>";
            }
            else{
                if(elem.added === undefined && elem.removed === undefined){
                    text += "<span>" + elem.value + "</span>";
                }else{
                    if(elem.added === true){
                        text += "<span class='highlight'>" + elem.value + "</span>";
                        if(elem.value.indexOf('\n') !== -1){
                            text += "<br>";
                        }
                    }
                }
            }
        });
    }
   

   return text;
}

app.get("/getTablaEjerciciosAtrasados", (request, response) =>{

   // console.log(request.query);

    daoE.cargarEjerciciosAtrasados(request.query, (err, sol)=>{

        if(err){
            response.status(400);
            response.end();
        }else{
          // console.log(sol);
            response.json(sol);
            response.status(200);
            response.end();
        }

    });


})


app.get("/subirAlumno/:id/:idAlumno", (request, response) => {
    var data = {};
    //console.log(request.params);
    data.idEjercicio = Number(request.params.id);
    data.idAlumno = Number(request.params.idAlumno);
  
    if(!isNaN(data.idEjercicio)){
        daoE.seleccionarEjercicio(data.idEjercicio,  data.idAlumno, (error, res) =>{
            if(error){
                alert(err);
            }else{
               daoE.entregaRetrasada(data.idEjercicio, (err, infoAlta)=>{
                    if(err){
                        alert(err);
                    }else{
                        var hoy = new Date();
                        //console.log(`infoAlta ${infoAlta}`);
                        var infoRender = {};
                        infoRender.titulo = res.ejercicio.titulo;
                        infoRender.enun = res.ejercicio.enunciado;
                        infoRender.retrasada = "NO";
                        if(hoy > infoAlta){
                            infoRender.retrasada = "SI";
                        }
                        if(res.ejAlumno){
                            infoRender.solucion = res.ejAlumno.solucion;
                           // sol.solucionProfe = res.ejAlumno.correccionProfesor;
                            infoRender.nota = res.ejAlumno.nota;
                          
                        }else{
                            infoRender.nota = " -";
                            infoRender.solucion = "";
                            infoRender.solucionProfe = ""; 
                        }
                       
                        daoE.scriptsPorID(data.idEjercicio, (err, res)=>{
                            if(err){
                                console.log(err);
                            }else{
                                var datos = {};
                                datos.idAlumno = data.idAlumno;
                                datos.idEjercicio = data.idEjercicio;
                                daoE.getUltimaEntrega(datos, (err, sol)=>{
                                    if(err){
                                       // console.log(err);
                                    }else{
                                        var solucion = "<span>No tienes comentarios</span>";
                                        if(sol !== undefined){
                                            solucion = highlight(sol.comentarioProfe, sol.solAlumno);
                                        }
                                       
                                       infoRender.solucionProfe = solucion;
                                       //console.log(infoRender);
                                       response.render("subirAlumno", {data:infoRender});
                                    }
                                });
                                
                            }
                        })
                    }
               })
            }
        })      
    }
});

app.get("/mostrarAlumnos", (request, response)=>{
    //request.query.id === id del profesor
    daoU.mostrarAlumnos(request.query.id, (err, filas) =>{
        if(err){
            console.log("ha habido un error");
        }else{
            console.log(filas);
            response.status(201);
            response.json(filas);
            response.end();
        }
    })
});

app.get("/mostrarListaEjer", (request, response)=>{
    daoE.listarTodosEjercicios((err, filas)=>{
        if(err){
            console.log("ha habido un error");
        }else{
            response.status(201);
            response.json(filas);
            response.end();
        }
    })
});

app.get("/getCursoGrupo/:id", (request, response) =>{
    let id = Number(request.params.id);
    daoA.listarCursoGrupo(id, (err, filas) =>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.status(200);
            response.json(filas);
            response.end();
        }
    })
});

app.post("/crearAsignatura",(request, response) =>{
    daoU.crearAsignatura(request.body,(err, op) =>{
        if (err){
            response.status(400); //mal introducido
            response.end();
        }
        else {
            response.status(201);
            response.end();
        }
    });
});

app.post("/cargarAsignaturas",(request, response) =>{
    daoU.cargarAsignaturas((err, op) =>{
        if (err){
            response.status(400); //mal introducido
            response.end();
        }
        else {
            response.json(op);
            response.status(201);
            response.end();
        }
    });
});
 
app.post("/eliminarAsignatura",(request, response) =>{
   // console.log(request.body);
    daoU.eliminarAsignatura(request.body,(err, op) =>{
        if (err){
            response.status(400); //mal introducido
            response.end();
        }
        else {
            response.status(201);
            response.end();
        }
    });
});

app.get("/evaluaAlumno", (request, response)=>{
   
    daoU.evaluaAlumno(request.query.id, (err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            console.log(filas);
            response.json(filas);
            response.status(201);
            response.end();
        }
    })
});

app.post("/actualizaComentarioNota", (request, response)=>{

    console.log(request.body);

    daoE.actualizaEjercicioAlumno(request.body, (err, filas)=>{
        if(err){
            console.log("err");
            response.status(400);
            response.end();
        }else{
            response.status(201);
            response.end();
        }
    })
    
});

app.get("/getUltimaEntrega", (request, response)=>{
    console.log("getUltimaEntrega");
    console.log(request.query);
    daoE.getUltimaEntrega(request.query, (err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.json(filas);
            response.status(201);
            response.end();
        }
    })
})
//Cambiar a get ya que solo pide datos
app.post("/entregaRetrasada", (request, response)=>{
    //console.log("entregaRetrasada "+request.body.idEjercicio);
    daoE.entregaRetrasada(request.body.idEjercicio, (err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            //console.log("vuelta"+filas);
            response.json(filas);
            response.status(201);
            response.end();
        }
    })
});

app.get("/getIntentosAlumno", (request, response)=>{
    //console.log(request.query);
    daoE.getIntentosAlumno(request.query, (err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.json(filas);
            response.status(201);
            response.end();
        }
    });
});

app.post("/numeroDeIntentos", (request, response)=>{
    //console.log("numeroDeIntentos "+request.body.idEjercicio);
    daoE.numeroDeIntentos(request.body.idEjercicio, (err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            //console.log("vuelta "+filas);
            response.json(filas);
            response.status(201);
            response.end();
        }
    })
});

app.post("/ejecutarProcedimientoAlumno", (request, response)=>{
    //console.log("subirProcedimientoAlumno");
    //console.log(request.body);
    //console.log("idEjercicio:");
    //console.log(request.body.idEjercicio);
    daoE.scriptsPorID(request.body.info.idEjercicio, (err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            //ORACLEDB
            var scripts = [];
            //console.log("scriptsPorID");
            //console.log(filas);
            filas.forEach(e =>{
                scripts.push(e.script);
            });
            // console.log(scripts);           
            daoE.getCreacionTablasPorID(request.body.info.idEjercicio, (err, sol)=>{
                if(err){
                    response.status(400); 
                    response.end();
                }else{
                    oracleAlumno.connect(sol,scripts,request.body.info,(err, resultado)=>{
                        //console.log(conection);
                       // console.log("error \n" + err);
                        //console.log("res \n" + resultado);
                        if(err){
                            //oracleAlumno.disconnect(conection);
                           // console.log(err);
                            var error={};
                            error.oracle = err;
                            //console.log("error \n" + error.oracle);
                            //console.log("APP connect allError:"+err);
                            //response.json(error);
                            response.send(400, error);
                           // response.status(400);
                            response.end();
                        }else{
                            //oracleAlumno.disconnect(conection);
                            for(let i=0; i< resultado.length;i++)
                                resultado[i]=resultado[i].toString();
                            response.json(resultado);
                            response.status(201);
                            response.end();
                        }
                    });
                }
            })
            /* daoE.subirProcedimientoAlumno(request.body, (err, filas)=>{
                if(err){
                    response.status(400);
                    response.end();
                }else{
                    response.json(filas);
                    response.status(201);
                    response.end();
                }/                    })*/
            // });
        }
    });
});
/*async function crearAlumno(request,callback){
    var oP = await oracleProfesor.connect(undefined,request.body);
    console.log(oP);
    if(oP){
        console.log(oP);
        callback(true);
    }
}*/
app.post("/crearAlumno", (request, response)=>{
    //console.log("crearAlumno");
    //console.log(request.body);

    oracleProfesor.altaUsuario(request.body.usuario,(err,sol) =>{
        if(sol){
            console.log(sol);
            response.status(201);
            response.end();
        }else{
            console.log(err);
            response.status(400);
            response.end();
        }
    });
});

app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});
