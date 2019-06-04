"use strict";
/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class DAOUsers {
   
    constructor(pool) {
        this.pool = pool;
    }

    cargarAlumnos(alumnos, callback) { ///////////////////////// revisar
        //console.log(alumnos);
        this.pool.getConnection((err, conexion) => {
            if(err){
                callback(err);
            }else{
                var cursoYGrupo= alumnos.cursoYGrupo;
                //Quito los espacios saltos de linea y tabulaciones
                alumnos = alumnos.script.replace(/\r|\n|\t|/g, '');
                alumnos = alumnos.split(";");
                //Elimino la ultima posicion del array que contiene un vacio
                alumnos.splice(alumnos.length-1, 1);
                //Creo la consulta para todos los alumnos
                var sql=`INSERT INTO alumno (correo, nombre, apellidos, pass, cambioContrasenia, idGrupo) VALUES `;
                for(let c = 0; c < alumnos.length; c++){
                    sql += `(` + `?` + `, ` + `?` + `, `+`?` + `, `+`?` + `, `+`?` +`, `+`?`+`)`
                    if(c !== alumnos.length -1){
                        sql += `, `
                    }
                }
                sql += `;`;
                //console.log("SQL: "+sql);
                //Añadimos al array aux los datos por cada alumno y concatenamos un 0 para indicar que el alumno tiene que cambiar la contraseña y el curso al quep ertenece el alumno
                var aux=[];
                var fecha = new Date();
                var year = fecha.getFullYear();
                year = year - 1;
                fecha.setFullYear(year);
                for(var i=0;i<alumnos.length;i++){
                    aux.push(alumnos[i].split(",").concat([fecha,Number(cursoYGrupo)]));
                    //aux.push(alumnos[i].split(",").concat([alumnos.cursoYGrupo]));
                };
                //Concatenamos los arrays obtenido como resultados del anterior bucle, para tener uno solo con los datos separados por comas
                var aux2 =[];
                for(var i=0;i<aux.length-1;i++){
                    aux2=aux2.concat(aux[i],aux[i+1]);
                };
                //console.log(aux2);
                //console.log(sql);
                conexion.query(sql, aux2, (err, res) => {
                    if(err){
                        callback(err);//console.log("Error: "+res.insertId);
                    }
                    else{ 
                        callback(undefined);//console.log(res.insertId);
                    }
                });
                conexion.release();
            }
        });
    }

    cargarNotasAlumnos(){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`INSERT INTO asignatura (descripcion, curso) VALUES (?,?)`,
                [datos.asignatura, datos.curso], (err, filas) =>{
                    if(err){
                        console.log("no ha podido insertar");
                        callback(err, undefined);
                    }
                    else{
                        callback(undefined, filas.insertId);
                    }
                })
                con.release();
            } 
        });
    }
    
    crearCursoYGrupo(datos, callback){
        //console.log("datos");
        //console.log(datos);
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`INSERT INTO grupos (idAsignatura, anio, grupo) VALUES (?,?,?)`,
                [datos.asig,datos.anio, datos.letra], (err, filas) =>{
                    if(err){
                        console.log("no ha podido insertar 1");
                        callback(err, undefined);
                    }
                    else{
                        con.query(`INSERT INTO profegrupo (idGrupo, idProfesor) VALUES (?,?)`,
                        [filas.insertId, datos.idProfesor], (err, filas) =>{
                            if(err){
                                console.log("no ha podido insertar 2");
                                callback(err, undefined);
                            }
                            else{
                                callback(undefined, filas.insertId);
                            }
                        })
                    }
                })
                con.release();
            }
        });
    }

    eliminarCursoYGrupo(datos, callback){ 
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                //console.log(datos.idProfesor+" "+ datos.idGrupo);
                con.query(`DELETE FROM grupos WHERE idGrupo = ?`,
                [Number(datos.idGrupo)], (err, filas) =>{
                    if(err){
                        console.log(err);
                        callback(err, undefined);
                    }
                    else{
                        con.query('DELETE FROM profegrupo WHERE idProfesor = ? AND idGrupo = ?',
                        [datos.idProfesor, Number(datos.idGrupo)], (err, f)=>{
                            if(err){
                                console.log(err);
                                callback(err, undefined);
                            }else{
                                callback(undefined, f.insertId);
                            }
                        })
                        con.release();
                    }
                })
            }
        });
    }

    // cargarCursoYGrupo(datos, callback){
    //     this.pool.getConnection((err, con) =>{
    //         if(err){
    //             callback(err);
    //         }else{
    //             con.query(`SELECT * from profegrupo pg, grupos g, asignatura a where pg.idProfesor = ? and g.idGrupo = pg.idGrupo and a.idAsignatura = g.idAsignatura`,
    //             [datos.idProfesor], (err, resultado) =>{
    //                 if(err || resultado.length === 0){
    //                     callback(err, undefined);
    //                 }
    //                 else{   
    //                     callback(undefined, resultado)
    //                 }
    //             })
    //             con.release();
    //         }
    //     });
    // }

    createProfesor(datos, callback){ //////////////////////////////// revisar
        //console.log(datos);
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`INSERT INTO profesor (correo, nombre, pass) VALUES (?,?,?)`,
                [datos.correo, datos.nombre, datos.password], (err, filas) =>{
                    if(err){
                        //console.log("no ha podido insertar");
                        callback(err, undefined);
                    }
                    else{
                        callback(undefined, filas.insertId);
                    }
                })
                con.release();
            }
        });
    }
   
    mostrarAlumnos(datos, callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err, undefined);
            }else{
                var sql = `select * 
                FROM 
                    (select h.idGrupoProfe as "idG", h.grupo, h.idAsignatura as "idA", a.descripcion, a.curso
                     from (select pg.idGrupo as "idGrupoProfe", g.grupo, g.idAsignatura, pg.idProfesor
                            FROM profegrupo pg JOIN grupos g 
                            ON pg.idGrupo = g.idGrupo 
                            AND pg.idProfesor = ?) h JOIN asignatura a 
                     ON h.idAsignatura = a.idAsignatura) g2 JOIN alumno a 
                ON a.idGrupo = g2.idG`
                con.query(sql, [datos], (err, filas)=>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var sol = [];
                        var row = {};
                        filas.forEach(e =>{
                            row.nombre = e.nombre;
                            row.apellidos = e.apellidos;
                            row.correo = e.correo;
                            row.curso = e.curso + "º";
                            row.grupo = e.grupo;
                            row.asignatura = e.descripcion;
                            var fecha = new Date(e.cambioContrasenia);
                            var actual = new Date();
                            if(fecha.getFullYear() >= actual.getFullYear()){
                                row.contrasenia = "SI"
                            }else{
                                row.contrasenia = "NO";
                            }
                            sol.push(row);
                            row = {};
                        })
                        callback(undefined, sol);
                    }
                })
                con.release();
            }
        })
    }

    isProfesor(login, password, callback) { //comprobacion usuario  
        this.pool.getConnection((err, conexion) =>{
            if(err){
                callback(err);
            }
            else{
                conexion.query(`select * from profesor where correo = ? and pass = ?`, [login , password], 
                (err, resultado) =>{ 
                    if(!err){
                        if(resultado.length === 0){
                            callback(undefined, false, undefined)
                        }else{
                            var profesor={};
                            var sol = [];
                            resultado.forEach(e => {
                                profesor.correo=(e.correo);
                                profesor.nombre=(e.nombre);
                                profesor.idProfesor=(e.idProfesor);
                                profesor.user="profesor";
                                sol.push(profesor);
                            });
                            console.log("profesor");
                            console.log(profesor);
                            callback(undefined, true, sol)
                        }
                    }
                    else{
                        callback(err, undefined);
                    }
                })
            }
        });
    }

    isAlumno(login, password, callback) { //comprobacion usuario
        this.pool.getConnection((err, conexion) =>{
            if(err){
                //console.log(err);
                callback(err);
            }
            else{
                conexion.query(`select * from alumno where correo = ? and pass = ?`, 
                [login , password], (err, resultado) =>{
                    //console.log("resultado:"+resultado);
                    if(!err){
                        //console.log(resultado);
                        //console.log("resultado.length :"+resultado.length)
                        if(resultado.length === 1){
                            //console.log("un resultado");
                            var alumno = {}
                            var sol = [];
                            resultado.forEach(e => {
                                //console.log("bucle 1");
                                alumno.correo=e.correo;
                                alumno.nombre=e.nombre;
                                alumno.apellidos=e.apellidos;
                                alumno.idGrupo=e.idGrupo;
                                alumno.idAlumno=e.idAlumno;
                                alumno.cambioContrasenia=e.cambioContrasenia;
                                alumno.nAsignaturas = resultado.length;
                                alumno.user="alumno";
                                conexion.query(`SELECT a.descripcion,a.curso,a.idAsignatura,g.grupo,g.anio 
                                                FROM grupos g, asignatura a 
                                                WHERE g.idAsignatura = a.idAsignatura and g.idGrupo = ?`,
                                [e.idGrupo], (err, filas) =>{
                                    if(err){
                                        console.log("error al coger curso y grupo una constraseña");
                                        console.log(err);
                                        callback(undefined, false, undefined);
                                    }else{
                                        filas.forEach(elem => {
                                            //console.log("bucle 2");
                                            alumno.descripcion= elem.descripcion;
                                            alumno.anio=elem.anio;
                                            alumno.curso= elem.curso;
                                            alumno.grupo=elem.grupo;
                                            alumno.idAsignatura= elem.idAsignatura;
                                            sol.push(alumno);
                                            alumno = {}
                                            callback(undefined, true, sol);
                                        });
                                    }
                                });
                            });
                        }else{
                            conexion.query(`SELECT ag.correo, ag.nombre, ag.apellidos, ag.pass, ag.idG as idGrupo , ag.idAlumno, ag.cambioContrasenia, a.descripcion,a.curso, ag.grupo,ag.anio,a.idAsignatura from 
                                            (   select a.correo, a.nombre, a.apellidos, a.pass, a.idGrupo as idG , a.idAlumno , a.cambioContrasenia ,g.grupo, g.anio, g.idAsignatura 
                                                from alumno a join grupos g ON g.idGrupo = a.idGrupo and a.correo = ? and a.pass= ? )
                                            ag INNER JOIN asignatura a ON ag.idAsignatura = a.idAsignatura `, 
                            [login,password],(err,resultado)=>{
                                if(!err){
                                    if(resultado.length === 0){
                                        //console.log("Error :"+err);
                                        callback(undefined, false, undefined);
                                    }else{ 
                                        //console.log("mas de un resultado");
                                        var alumno={};
                                        var sol = [];
                                        resultado.forEach(e=>{
                                            alumno.nAsignaturas = resultado.length;
                                            alumno.correo=e.correo;
                                            alumno.nombre=e.nombre;
                                            alumno.apellidos=e.apellidos;
                                            alumno.pass=e.pass;
                                            alumno.idGrupo=e.idGrupo;
                                            alumno.idAlumno=e.idAlumno;
                                            alumno.cambioContrasenia=e.cambioContrasenia;
                                            alumno.user="alumno";
                                            alumno.descripcion= e.descripcion;
                                            alumno.anio=e.anio;
                                            alumno.curso= e.curso;
                                            alumno.grupo=e.grupo;
                                            alumno.idAsignatura= e.idAsignatura;
                                            sol.push(alumno);
                                            alumno = {}
                                            //filas[0].descripcion+" "+ filas[0].curso+"º"+filas[0].grupo.toString();
                                        })
                                        //console.log(sol);
                                        callback(undefined, true, sol);
                                    }
                                }else{
                                    callback(undefined, false, undefined);
                                }
                            });
                        }
                        conexion.release();
                    }else{
                        console.log(err);
                        callback(undefined, false, undefined);
                    }
                });
            }
        });
    }

    cambiarpass(correo, passNueva,date,idAlumno, callback) { //comprobacion usuario
        this.pool.getConnection((err, conexion) =>{
            if(err){
                callback(err);
            }
            else{
                //UPDATE alumno SET pass = 'a', cambioContrasenia = '2010-05-18' WHERE alumno.idAlumno = 20;
                conexion.query(`update alumno set pass = ?, cambioContrasenia = ? where correo = ? and idAlumno = ?`, 
                [passNueva, date, correo,idAlumno], (err, resultado) =>{ 
                    if (!err) {
                        console.log("actualizado");
                        callback(undefined)
                    }else{
                        callback(err);
                    }
                })
                conexion.release();
            }
        });
    }

    isUserCorrect(correo, callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT correo FROM profesor WHERE correo =?`, [correo], (err, filas)=>{
                    if(err){
                        callback(err);
                    }else{
                        if(filas.length === 0){
                            callback(undefined, false);
                        }else{
                            callback(undefined, true);
                        }
                    }
                });
                con.release();
            }
        })
    }
   

    evaluaAlumno(data, callback){
        
        var ev = 1;

        var sql = `SELECT * 
        from (SELECT a.nombre, a.apellidos, a.idAlumno, a.idGrupo, ea.idEjercicio, ea.solucion, ea.nota, ea.numFallos, ea.entregaRetrasada, ea.intentos, ea.resultado 
               from ejercicioalumno ea join alumno a 
                ON ea.idAlumno = a.idAlumno and a.idGrupo = ?) a JOIN 
                    (select e.idEjercicio, e.numScriptsSol, e.titulo, ae.evaluacion, ae.numeroIntentos, ae.idGrupo
                     from ejercicio e join altaejercicio ae 
                     ON ae.idEj = e.idEjercicio and ae.evaluacion = ?) b
        ON a.idEjercicio = b.idEjercicio
        and a.idGrupo = b.idGrupo`; 
        var todos = [Number(data.grupo), Number(ev)];
      
        if(Number(data.tipo) === 1){
            ev = 0;
        }else if(Number(data.tipo) === 2){
            sql = `SELECT * 
            from (SELECT a.nombre, a.apellidos, a.idAlumno, a.idGrupo, ea.idEjercicio, ea.solucion, ea.nota, ea.numFallos, ea.entregaRetrasada, ea.intentos, ea.resultado 
                   from ejercicioalumno ea join alumno a 
                    ON ea.idAlumno = a.idAlumno and a.idGrupo = ?) a JOIN 
                        (select e.idEjercicio, e.numScriptsSol, e.titulo, ae.evaluacion, ae.numeroIntentos, ae.idGrupo
                         from ejercicio e join altaejercicio ae 
                         ON ae.idEj = e.idEjercicio) b
            ON a.idEjercicio = b.idEjercicio
            and a.idGrupo = b.idGrupo`;
            todos = [Number(data.grupo)];
        }
      
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
               
                con.query(sql, todos, (err, filas)=>{
                    if(err){
                        callback(err);
                    }else{
                        var sol = [];
                        var row = {};
                        filas.forEach(e=>{
                            row.idAlumno = e.idAlumno;
                            row.nombre = `${e.apellidos}, ${e.nombre}`;
                            row.idAlumno = e.idAlumno;
                            row.idGrupo = e.idGrupo;
                            row.idEjer = e.idEjercicio;
                            row.sol = e.solucion;
                            row.titulo = e.titulo;
                            row.nota = e.nota;
                            row.numScripts = `${e.numFallos}/${e.numScriptsSol}`;                           
                            row.intentos = e.intentos;
                            row.resultado = e.resultado;
                            sol.push(row);
                            row = {};
                        });
                        callback(undefined, sol); 
                    }
                });
                con.release();
            }
        })
    }
    notasAlumno(idAlumno,callback){
        console.log("idAlumno");
        console.log(idAlumno);
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                con.query(` SELECT ea.idEjercicio, e.titulo, ea.nota  
                            FROM (  SELECT ea.idEjercicio,ea.nota FROM alumno a, ejercicioAlumno ea
                                    WHERE a.idAlumno= ea.idAlumno AND a.idAlumno = ?) ea , ejercicio e 
                            where ea.idEjercicio = e.idEjercicio`,
                    [idAlumno], (err, filas)=>{
                    if(err){
                        callback(err);
                    }else{
                        if(filas.length === 0){
                            callback(undefined, false);
                        }else{
                            console.log(filas);
                            callback(undefined, filas);
                        }
                    }
                });
                con.release();
            }
        })
    }

    alumnosPorgrupo(idGrupo,callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                //console.log(idGrupo);
                con.query(`SELECT correo,nombre,apellidos,idAlumno FROM alumno WHERE idGrupo =?`, [Number(idGrupo)], (err, filas)=>{
                    if(err){
                        callback(err);
                    }else{
                        if(filas.length === 0){
                            //console.log("filas.length");
                            //console.log(filas.length);
                            callback(undefined, false);
                        }else{
                            //console.log(filas);
                            callback(undefined, filas);
                        }
                    }
                });
                con.release();
            }
        })
    }
}
   
module.exports = {
    DAOUsers: DAOUsers
}