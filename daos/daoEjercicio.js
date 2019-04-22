"use strict";
/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class DAOEjercicio {
   
    constructor(pool) {
        this.pool = pool;
    }
    //Implementando
    createEjercicio(datos, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var fech = new Date();
         
                con.query(`INSERT INTO ejercicio (titulo, fecha, numScriptsSol, creacionTablas, enunciado, solucionProfesor,idProfesor) VALUES(?,?,?,?,?,?,?)`,
                [datos.titulo, fech, datos.numScripts, datos.tablas, datos.enun, datos.sol, datos.idProfesor], (err, id) =>{
                    if(err){
                        callback(err, undefined);
                    }
                    else{
                        callback(undefined, id.insertId);
                    }
                });
               
            }
            con.release();
        });
    }

    subirScripts(datos, idEjercicio, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{

                var sql = "INSERT INTO scriptspruebas (idEjercicio, idPrueba, script) VALUES"

                for(var i = 0; i < datos.length;i++){
                    sql += " (?, ?, ?)"
                    if(i < datos.length - 1){
                        sql +=","
                    }else{
                        sql += ";"
                    }
                }

                var info = [];

                for(var j = 0; j < datos.length; j++) {
                    info.push(idEjercicio);
                    info.push(datos[j].id);
                    info.push(datos[j].archivo);
                }

                con.query(sql, info, (err, filas) =>{
                    if(err){
                        callback(err);
                    }else{
                        callback(undefined);
                    }
                });
            }
        })
    }

    listarEjerciciosAlta(datos, callback){ /// lista los ejercicios dados de alta
        this.pool.getConnection((err, con) =>{
            var fecha = new Date();
            if(err){
                callback(err);
            }else{//MYSQL:SELECT Titulo FROM `altaejercicio` INNER JOIN `ejercicio` ON altaejercicio.IdEj = ejercicio.IdEjercicio where evaluacion=1
            con.query(`SELECT Titulo,idEjercicio FROM altaejercicio a, ejercicio e where a.idEj = e.idEjercicio  
                and evaluacion = ? and DATE(fin) >= DATE(?)`,
                [datos, fecha], (err, resultado) =>{ 
                    if (!err) {
                        if (resultado.length === 0) 
                            callback(undefined, undefined);
                        else { 
                            let res = [];
                            resultado.forEach(e => {
                                res.push({titulo:e.Titulo, id:e.idEjercicio});
                            });
                            callback(undefined, res);
                        }
                    }else{
                        console.log("error en la query");
                        callback(err, undefined);
                    }
                });
                con.release();
            }
        });
    }
    descargarProfesor(datos, callback){
        console.log(datos);
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{//MYSQL://SELECT creacionTablas FROM `ejercicio` WHERE idEjercicio = 8 //SELECT creacionTablas, solucionProfesor, script FROM `ejercicio` e RIGHT JOIN `scriptspruebas` s ON e.idEjercicio = s.idEjercicio and e.idEjercicio = 11
            con.query(`SELECT creacionTablas, solucionProfesor, script FROM ejercicio e JOIN scriptspruebas s ON e.idEjercicio = s.idEjercicio and e.idEjercicio = ?`,
                [datos], (err, resultado) =>{ 
                    if (!err) {
                        if (resultado.length === 0) 
                            callback(undefined, undefined)
                        else {
                            let res = [];
                            res[0] = resultado[0].creacionTablas.split(",");
                            res[0] = new Buffer.from(res[0][1], 'base64').toString('ascii');
                            res[1] = resultado[0].solucionProfesor.split(",");
                            res[1] = new Buffer.from(res[1][1], 'base64').toString('ascii');
                            var  i, j, aux;
                            for(i = 2, j=0, aux=0; aux < resultado.length; i++, j++,aux++){
                                res[i] = resultado[j].script.split(",");
                                res[i] = new Buffer.from(res[i][1], 'base64').toString('ascii');
                            }
                            callback(undefined, res)
                        }
                    }else{
                        console.log("error en la query");
                        callback(err, undefined);
                    }
                });
                con.release();
            }
        });
    }

    solScripts(id,datos,callback){ 
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{                
                var sql = '';
                sql += "UPDATE scriptspruebas SET solucionPrueba = CASE idPrueba";
                console.log(datos.length);
                for (let i = 0; i < datos.length; i++) {
                    sql+= " WHEN "+(i+1)+" THEN '"+datos[i].toString()+"'";
                }
                sql+=" END WHERE idEjercicio ="+ id + ";";
                con.query(sql, (err, filas) =>{
                    if(err){
                        callback(err);
                    }else{
                        callback(undefined);
                    }
                });
                //sql="UPDATE scriptspruebas SET solucionPrueba = "+"'"+datos[i].toString()+"'"+ "WHERE idEjercicio ="+id+ " and idPrueba="+(i+1)+";";
                con.release();
            }
        })
    }

    seleccionarEjercicio(id, idAlumno, callback){
       
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err, undefined);
            }else{
                con.query(`select * from ejercicio e where e.idEjercicio = ?`, 
                [id], (err, res)=>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        con.query(`select * from ejercicioalumno where idEjercicio = ? and idAlumno = ?`,
                        [id, idAlumno], (err, filas) =>{
                            if(err){
                                callback(err, undefined);
                            }else{
                                var sol = {};
                                sol.ejercicio = res[0];
                                sol.ejAlumno = filas[0];
                                callback(undefined, sol);
                            }
                        });
                    }
                });
                con.release();
            }
        });
    }

    listarTodosEjercicios(callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err, undefined);
            }else{
                var sql = 'select * from ( select tab1.titulo, tab1.numScriptsSol, tab1.alta, p.nombre AS "Autor" , tab1.idGrupo as "idGrupo"' +
                'from (SELECT e.titulo AS "titulo", e.numScriptsSol AS "numScriptsSol", a.idEj AS "alta" , e.idProfesor AS "idProfe", a.idGrupo as "idGrupo"'+
                           ' FROM `ejercicio` e LEFT JOIN `altaejercicio` a ON e.idEjercicio = a.idEj) tab1, `profesor` p '+
                           ' where p.idProfesor = tab1.idProfe) t1 LEFT JOIN'+
                    '(select  asig.descripcion as "asignatura", asig.curso as "curso", g.grupo as "grupo", g.idGrupo as "id"'+
                   ' from asignatura asig, grupos g'+
                    ' where asig.idAsignatura = g.idAsignatura) t2 '+
                'ON t1.idGrupo = t2.id';
                con.query(sql, (err, filas) =>{
                    if(err){
                        console.log("error en la query " + err);
                        callback(err, undefined);
                    }else{

                        var lista = [];
                        var ejercicio = {};
                        filas.forEach(e =>{
                            ejercicio.titulo = e.titulo;
                            ejercicio.numScripts = e.numScriptsSol;
                            ejercicio.autor = e.Autor;
                            
                            if(e.alta === null){
                                ejercicio.alta = "NO";
                            }else{
                                ejercicio.alta = "SI";
                            }

                            if(e.asignatura === null){
                                ejercicio.asignatura = "-";
                            }
                            else{
                                ejercicio.asignatura = e.asignatura;
                            }

                            if(e.curso === null){
                                ejercicio.curso = "-";
                            }else{
                                ejercicio.curso = e.curso;
                            }
                            
                            if(e.grupo === null){
                                ejercicio.grupo = "-";
                            }else{
                                ejercicio.grupo = e.grupo;
                            }

                            lista.push(ejercicio);
                            ejercicio = {};
                            
                        })
                        callback(undefined, lista);
                    
                    }
                });
                con.release();
            }
        })
    }

    getUltimaEntrega(datos, callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                //console.log(datos);
                con.query(`SELECT * FROM ejercicioalumno WHERE idAlumno = ? AND idEjercicio = ?`,
                [datos.idAlumno, datos.idEjercicio], (err, filas)=>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var sol = {};
                       // console.log(filas);
                       if(filas.length === 0){
                           callback(undefined, undefined);
                       }else{
                        sol.solAlumno = filas[0].solucion;
                        sol.comentarioProfe = filas[0].correccionProfesor;
                      
                        callback(undefined, sol);
                       }
                    
                    }
                });
                con.release();
            }
        })
    }

    listarEjerciciosNoAlta(callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                con.query(`select * from ejercicio e where not exists ( select a.idEj from altaejercicio a where a.idEj = e.idEjercicio)`,
                (err, sol) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var solucion = [];
                        var fila = {};
                        sol.forEach(e =>{
                            fila.id = e.idEjercicio;
                            fila.titulo = e.titulo;
                            solucion.push(fila);
                            fila = {};
                        });

                        callback(undefined, solucion);
                    }
                });
                con.release();
            }
        })
    }

    altaEjercicio(datos, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`INSERT INTO altaejercicio (idGrupo, ini, fin, idEj, evaluacion, numeroIntentos) VALUES(?,?,?,?,?, ?)`,
                [datos.idGrupo, datos.ini, datos.fin, datos.idEj, datos.evaluacion, datos.numIntentos], (err) =>{
                    if(err){
                        callback(err, undefined);
                    }
                    else{
                        callback(undefined, true);
                    }
                });
               
            }
            con.release();
        });
    }

    entregaRetrasada(idEjercicio, callback){
        console.log("datos"+idEjercicio);
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT fin FROM altaejercicio WHERE idEj =?`,[idEjercicio],(err, filas)=>{
                    if(err){
                        console.log("err");
                        callback(err);
                    }else{
                        if(filas.length === 0){
                            console.log("query 0");
                            callback(undefined, false);
                        }else{
                            
                            console.log(filas[0].fin);
                            callback(undefined, filas[0].fin);
                        }
                    }
                });
                con.release();
            }
        })
    }

    numeroDeIntentos(idEjercicio, callback){
        console.log("datos"+idEjercicio);
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT numeroIntentos FROM altaejercicio WHERE idEj =?`,[idEjercicio],(err, filas)=>{
                    if(err){
                        console.log("err");
                        callback(err);
                    }else{
                        if(filas.length === 0){
                            console.log("query 0");
                            callback(undefined, false);
                        }else{
                            
                            console.log(filas[0].numeroIntentos);
                            callback(undefined, filas[0].numeroIntentos);
                        }
                    }
                });
                con.release();
            }
        })
    }

    actualizaEjercicioAlumno(datos, callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                var sql = `UPDATE ejercicioalumno SET correccionProfesor =?, nota=?WHERE idEjercicio = ? AND idAlumno = ?;`
                con.query(sql, [datos.comentario, Number(datos.nota), datos.idEjercicio, datos.idAlumno], (err, filas)=>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        callback(undefined, true);
                    }
                });
                con.release();
            }
        });
    }
    //  terminar no funcionaaaaaaaaaaaaaaa
    subirProcedimientoAlumno(datos, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`INSERT INTO ejercicioalumno (idGrupo, ini, fin, idEj, evaluacion) VALUES(?,?,?,?,?)`,
                [datos.idGrupo, datos.ini, datos.fin, datos.idEj, datos.evaluacion], (err) =>{
                    if(err){
                        callback(err, undefined);
                    }
                    else{
                        callback(null);
                    }
                });
            }
            con.release();
        });
    }

    
    
    scriptsPorID(idEjercicio,callback){
        console.log("datos "+idEjercicio);
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT * FROM scriptspruebas WHERE idEjercicio =?`,[idEjercicio],(err, filas)=>{
                    if(err){
                        console.log("err");
                        callback(err);
                    }else{
                        if(filas.length === 0){
                            console.log("query 0");
                            callback(undefined, false);
                        }else{
                            let res = [];
                            let i;
                            var sol = {};
                          
                            filas.forEach(e=>{
                                var script = e.script.split(",");
                                script = new Buffer.from(script[1], 'base64').toString('ascii');
                                sol.script = script;
                                sol.solucionPrueba = e.solucionPrueba;
                                res.push(sol);
                                sol = {};
                            })
                            
                            /*callback(undefined, filas[0].numeroIntentos);*/
                            callback(undefined, res);
                        }
                    }
                });
                con.release();
            }
        })
    }

    getIntentosAlumno(datos, callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                var sql=`SELECT intentos FROM ejercicioalumno WHERE idAlumno = ? AND idEjercicio=?`;
                con.query(sql, [datos.idA, datos.idEjercicio], (err, filas)=>{
                    if(err){
                        callback(err, undefined);
                    }
                    else{
                        console.log(filas);
                        var sol = 0;
                        if(filas.length === 0){
                            sol = 0;
                        }else{
                            sol = filas[0]
                        }
                       
                        callback(undefined, sol);
                    }
                });
                con.release();
            }
        })
    }
}
module.exports = {
    DAOEjercicio: DAOEjercicio
}