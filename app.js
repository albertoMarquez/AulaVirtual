const express = require("express");
const path = require("path");
const mysql = require("mysql");
const oracle = require("./conectionOracle.js");
//const oracleProcedure = require("./conectionOracleProcedure.js");
const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
const config = require("./config");
const bodyParser = require("body-parser");

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
         }
         else {
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

    daoE.altaEjercicio(datos, (err, filas) =>{
        if(err){
            response.status(400);
            response.end();
        }else{
            response.status(200);
            response.end();
        }
    })     
 })

 app.post("/subirEjercicio", (request, response) =>{
    var data = {};
    data.enun = request.body.enun;
    data.sol = request.body.solucion;
    data.tablas = request.body.tablas;
    data.titulo = request.body.titu;
    data.idProfesor = request.body.idProfesor;
    data.numScripts = request.body.scripts.length;

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
                                oracle.connect(oracle.run,op,(sol)=>{
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
                                oracle.connect(oracle.run,op,(sol)=>{
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
app.get("/subirAlumno/:id", (request, response) => {
    var data = {};
    data.idEjercicio = Number(request.params.id);
    //  console.log(data);
    if(!isNaN(data.idEjercicio)){
        daoE.seleccionarEjercicio(data.idEjercicio, (error, res) =>{
            if(error){
                response.status(404);
                response.end();
            }else{
                var sol = {};
                sol.titulo = res.ejercicio.titulo;
                sol.enun = res.ejercicio.enunciado;
                if(res.ejAlumno){
                    sol.solucion = res.ejAlumno.solucion;
                    sol.solucionProfe = res.ejAlumno.correccionProfesor;
                    sol.nota = res.ejAlumno.nota;
                }else{
                    sol.nota = " -";
                    sol.solucion = "";
                    sol.solucionProfe = "";
                    
                }
                response.render("subirAlumno", {data:sol});
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
    daoU.cargarAsignaturas(request.body,(err, op) =>{
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
    console.log(request.body);
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

app.post("/entregaRetrasada", (request, response)=>{
    console.log("app"+request.body.idEjercicio);
    daoE.entregaRetrasada(request.body.idEjercicio, (err, filas)=>{
        if(err){
            response.status(400);
            response.end();
        }else{
            console.log("vuelta"+filas);
            response.json(filas);
            response.status(201);
            response.end();
        }
    })
});

app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});

