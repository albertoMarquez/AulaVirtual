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
                console.log(aux2);
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

    crearAsignatura(datos, callback){ 
        //console.log(datos);
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
    
    cargarAsignaturas(callback){ 
        //console.log( "dao"+datos.idProfesor);
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{//SELECT `descripcion`, `idAsignatura` FROM `asignatura` a
                con.query(`SELECT descripcion, idAsignatura FROM asignatura a`,
                (err, resultado) =>{
                    if(err || resultado.length === 0){
                        //console.log("error consulta");
                        callback(err, undefined);
                    }
                    else{
                        //console.log("Hola" +resultado);
                        callback(undefined, resultado)
                    }
                })
                con.release();
            }
        });
    }

    eliminarAsignatura(datos, callback){ 
       // console.log("eliminar"+ datos.asignatura);
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`DELETE FROM asignatura WHERE asignatura.idAsignatura = ?`,
                [datos.asignatura], (err, filas) =>{
                    if(err){
                        console.log("no ha podido borrar");
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
        console.log(datos);
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`INSERT INTO grupos (idAsignatura, anio, grupo) VALUES (?,?,?)`,
                [datos.asig,datos.anio, datos.letra], (err, filas) =>{
                    if(err){
                        //console.log("no ha podido insertar");
                        callback(err, undefined);
                    }
                    else{
                        con.query(`INSERT INTO profegrupo (idGrupo, idProfesor) VALUES (?,?)`,
                        [filas.insertId, datos.idProfesor], (err, filas) =>{
                            if(err){
                                //console.log("no ha podido insertar");
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
                con.query(`DELETE FROM grupos WHERE idGrupo = ?`,
                [datos.idGrupo], (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }
                    else{
                        con.query('DELETE FROM profegrupo pg WHERE idProfesor = ? AND idGrupo = ?',
                        [datos.idProfesor, Number(datos.idGrupo)], (err, f)=>{
                            if(err){
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

    cargarCursoYGrupo(datos, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT * from profegrupo pg, grupos g, asignatura a where pg.idProfesor = ? and g.idGrupo = pg.idGrupo and a.idAsignatura = g.idAsignatura`,
                [datos.idProfesor], (err, resultado) =>{
                    if(err || resultado.length === 0){
                        callback(err, undefined);
                    }
                    else{   
                        callback(undefined, resultado)
                    }
                })
                con.release();
            }
        });
    }

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
                            resultado.forEach(e => {
                                profesor.correo=(e.correo);
                                profesor.nombre=(e.nombre);
                                profesor.idProfesor=(e.idProfesor);
                                profesor.user="profesor";
                            });
                            //console.log(profesor);
                            callback(undefined, true, profesor)
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
                //cambiar
                conexion.query(`select * from alumno where correo = ? and pass = ?`, 
                [login , password], (err, resultado) =>{
                    //console.log("resultado:"+resultado);
                    if(!err){
                        if(resultado.length === 0){
                            //console.log(res);
                            callback(undefined, false, undefined)
                        }else{ 
                            var alumno={};
                            resultado.forEach(e => {
                                alumno.correo=e.correo;
                                alumno.nombre=e.nombre;
                                alumno.apellidos=e.apellidos;
                                alumno.idGrupo=e.idGrupo;
                                alumno.idAlumno=e.idAlumno;
                                alumno.cambioContrasenia=e.cambioContrasenia;
                                alumno.user="alumno";
                            });
                            //console.log(alumno);
                            callback(undefined, true, alumno)
                        }
                    }else{
                        callback(err, undefined);
                    }
                })
                conexion.release();
            }
        });
    }

    cambiarpass(correo, passNueva,date, callback) { //comprobacion usuario
        this.pool.getConnection((err, conexion) =>{
            if(err){
                callback(err);
            }
            else{
                conexion.query(`update alumno set pass = ?, cambioContrasenia = ? where correo = ?`, 
                [passNueva, date, correo], (err, resultado) =>{ 
                    if (!err) {
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
        //console.log(data);
        var ev = 1;
        if(data.tipo === 1){
            ev = 0;
        }

        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                var sql = `SELECT * 
                from (SELECT a.nombre, a.apellidos, a.idAlumno, a.idGrupo, ea.idEjercicio, ea.solucion, ea.nota, ea.numFallos, ea.entregaRetrasada, ea.intentos, ea.resultado 
                    from ejercicioalumno ea join alumno a 
                    ON ea.idAlumno = a.idAlumno and a.idGrupo = ?) a JOIN (select e.idEjercicio, e.numScriptsSol, e.titulo, ae.evaluacion, ae.numeroIntentos 
                                                                            from ejercicio e join altaejercicio ae 
                                                                            ON ae.idEj = e.idEjercicio and ae.evaluacion = ?) b
                ON a.idEjercicio = b.idEjercicio`; 
                con.query(sql, [Number(data.grupo), Number(ev)], (err, filas)=>{
                    if(err){
                        callback(err);
                    }else{

                        //console.log(filas);
                        
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

}
   
module.exports = {
    DAOUsers: DAOUsers
}