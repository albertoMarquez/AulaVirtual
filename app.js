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
    daoU.isProfesor(request.body.login, request.body.password, (err, op, profesor) =>{
        if (err){
            response.status(400); //mal introducido
            response.end();
        }else {
            if (op === false) { // el profesor no existe
                daoU.isAlumno(request.body.login, request.body.password, (err, op, alumno) =>{
                    if(err){ // mal introducido
                        response.status(400);
                        response.end();
                    }else{
                        if(op === false){ //el alumno no existe
                            response.status(400);
                            response.end(); 
                        }
                        else{ //es profesor
                            console.log(alumno);
                            response.json(alumno);
                            response.status(201); //el usuario es correcto
                            response.end();
                        }
                    }
                })
            }else{
                console.log(profesor);
                response.json(profesor);
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
   /* console.log("request");
    console.log(request);
    console.log("request.body.pass1");
    console.log(request.body.pass1);
    console.log("request.body.pass2");
    console.log(request.body.pass2);
    console.log("user.idAlumno");
    console.log(request.body.idAlumno);*/
   if(request.body.pass1 === request.body.pass2){
        daoU.cambiarpass(request.body.user, request.body.pass1, request.body.date, request.body.idAlumno, (err) =>{
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

app.post("/bajaEjercicio", (request, response) =>{  
    var datos = request.body.ejer; 
    daoE.bajaEjercicio(datos, (err, filas) =>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.status(201);
            response.end();
        }
    })   
});

app.get("/listarBajaEjercicio", (request, response) =>{
    daoE.listarBajaEjercicio(request.query.id, (err, filas) =>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.json(filas);
            response.status(201);
            response.end();
        }
    })
});

app.get("/getAsignaturasEjercicioGrupo", (request, response) =>{
  //  console.log(request.query);
    daoA.listarAsignaturasEjerEnGrupo(request.query, (err, filas) =>{
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

app.get("/getAsignaturasOtrosAnios", (request, response) =>{
    daoE.listarEjerciciosAltaAniosPasados(request.query.idA, (err, filas) =>{
        if(err){
            response.status(400);
            response.end();
        }else{
            console.log("getAsignaturasOtrosAnios");
            console.log(filas);
            response.json(filas);
            response.status(201);
            response.end();
        }
    })
});

app.post("/principal", (request, response) =>{
   // console.log(request.body);
    // oracle.alerta();
    
    daoE.listarEjerciciosAlta(request.body.tipo, request.body.id,(err, op) =>{
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

app.get("/getEjercicios", (request, response) =>{
    daoE.listarEjercicios((err, ejs) =>{
        //console.log(ejs);
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
    daoA.listarAsignaturas(request.query.id, (err, filas) =>{
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
         
            /*if(elem.value === '\n' || elem.value === '\r\n' || elem.value === '\r\n \r\n' || 
            elem.value === '\r\n  ' || elem.value === '\n \n' || elem.value === '\n    ' ||
            elem.value === '\r\n    ' || elem.value === '\n  ' || elem.value === '\n  ' || 
            elem.value === '\r\n  ' || elem.value === '\r\n\r\n' || elem.value === '\n \n  ' ||
            elem.value === '\n  \n    ' || elem.value === '\r\n       \t' || elem.value === '\r\n            ' ||
            elem.value === '\n\n    '){
                text += "<br>";
            }*/
            if(elem.value === '\n' || elem.value === '\r'){
                text += "<br>";
            }else if(elem.value === '\r\n\r\n'|| elem.value === '\r\n \r\n'){
                text += "<br><br>";
            }else{
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
    daoE.cargarEjerciciosAtrasados(request.query, (err, sol)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
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
                        console.log(err);
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
                                        //console.log(sol);
                                        if(sol !== undefined && sol.comentarioProfe !== null){
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


app.get("/mostrarListaEjerNoAsignados", (request, response) =>{
    daoE.listarEjerciciosNoAsignados(request.query, (err, filas) =>{
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

app.get("/mostrarListaEjerAlta", (request, response)=>{
    //request.query={ tipo: '1', idG: '1', idA: '1', user: '1' }
    //console.log(request.query);
    daoE.listarTodoEjerciciosAlta(request.query, (err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.json(filas);
            response.status(201);
            response.end();
        }
    });
})

/*app.get("/mostrarListaEjer", (request, response)=>{
    daoE.listarTodosEjercicios((err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.status(201);
            response.json(filas);
            response.end();
        }
    })
});*/

app.get("/getCursoGrupoEjerAlta", (request, response)=>{
    daoA.listarCursoGrupoEjerAlta(request.query, (err, filas) =>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.status(200);
            response.json(filas);
            response.end();
        }
    })
})

app.get("/getCursoGrupo", (request, response) =>{
    let id = Number(request.query.id);
    var idProfe = Number(request.query.idP);
    daoA.listarCursoGrupo(id, idProfe, (err, filas) =>{
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
app.get("/getCursoGrupoNoAlta", (request, response) =>{
   // console.log(request.query);
    daoA.listarCursoGrupoNoAlta(request.query, (err, filas) =>{
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
    //console.log(request.query);
    daoU.evaluaAlumno(request.query, (err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            //console.log(filas);
            response.json(filas);
            response.status(201);
            response.end();
        }
    });
});

app.post("/actualizaComentarioNota", (request, response)=>{
    //console.log(request.body);
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
    //console.log("getUltimaEntrega");
    //console.log(request.query);
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
});

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
    daoE.scriptsPorID(request.body.info.idEjercicio, (err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            var scripts = [];
            filas.forEach(e =>{
                scripts.push(e.script);
            });
            daoE.getCreacionTablasPorID(request.body.info.idEjercicio, (err, sol)=>{
                if(err){
                    console.log("creacionTablas");
                    console.log(err);
                    response.status(400); 
                    response.end();
                }else{
                    oracleAlumno.connect(sol,scripts,request.body.info,(err, resultado)=>{
                        if(err){
                            var error={};
                            error.oracle = err;
                            response.send(400, error);
                            response.end();
                        }else{
                            let res= "";
                            resultado.forEach(e => {
                                res += e;                                
                            });
                            let errores = numeroDeErrores(resultado);
                            daoE.entregaRetrasada(request.body.info.idEjercicio,(err,infoAlta)=>{
                                if(err){
                                    console.log(err);
                                    response.status(400);
                                    response.end();
                                }else{
                                    var hoy = new Date();
                                    if(hoy < new Date(infoAlta)){
                                        daoE.subirProcedimientoAlumno(request.body,res,errores.nErr,(err, sol)=>{
                                            if(err){
                                                response.status(400);
                                                response.end();
                                            }else{
                                                //console.log("resultado subirProcedimientoAlumno");
                                                //console.log(errores.r);
                                                response.json(errores.r);
                                                response.status(201);
                                                response.end();
                                            }
                                        });
                                    }else{
                                        response.json(errores.r);
                                        response.status(201);
                                        response.end();
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

function numeroDeErrores(resultado){
    res = {};
    res.errores = [];
    res.avisos = [];
    res.ok = [];
    nErr =0;
    for(let i=0; i < resultado.length;i++){
        resultado[i]=resultado[i].toString();
        if(resultado[i].indexOf("ERROR") >= 0){
            nErr++;
            res.errores.push(resultado[i]);
        }else if(resultado[i].indexOf("AVISO") >= 0){
            res.avisos.push(resultado[i]);
        }else{
            res.ok.push(resultado[i]);
        }
    }
    var sol = {};
    sol.r = res;
    sol.nErr = nErr;
    return sol;
}

app.post("/crearAlumno", (request, response)=>{
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
