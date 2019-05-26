"use strict";
/**
 * Proporciona operaciones para la gestión de ejercicios
 * en la base de datos.
 */
class DAOEjercicio {
   
    constructor(pool) {
        this.pool = pool;
    }
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
                con.release();
            }
        })
    }

    listarEjerciciosAlta(datos, idAlumno, callback){ /// lista los ejercicios dados de alta
        
        this.pool.getConnection((err, con) =>{
            var fecha = new Date();
            var anio = fecha.getFullYear();
            console.log(fecha);
            console.log(anio);
            console.log(datos);
            console.log(idAlumno);
            if(err){
                callback(err);
            }else{
                 con.query(`select * 
                            from (select c.idGrupo, idAsignatura, anio, grupo, c.Titulo, c.idEjercicio
                                        from (SELECT Titulo,idEjercicio, idGrupo 
                                                FROM altaejercicio a join ejercicio e 
                                                on a.idEj = e.idEjercicio  
                                                and evaluacion = ?
                                                and DATE(ini) <= DATE(?)) c JOIN grupos g
                                        ON c.idGrupo = g.idGrupo and g.anio = ?) tb1 JOIN alumno alu 
                            ON tb1.idGrupo = alu.idGrupo and alu.idAlumno = ?`,
                [datos, fecha, anio, idAlumno], (err, resultado) =>{ 
                    if (!err) {
                        if (resultado.length === 0) 
                            callback(undefined, undefined);
                        else { 
                            console.log("res");
                            console.log(resultado);
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

    listarTodoEjerciciosAlta(datos, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql = `select e.titulo, e.idEjercicio, ae.evaluacion, ae.numeroIntentos, ae.ini 
                from ejercicio e join altaejercicio ae join profegrupo pg 
                ON ae.idGrupo = pg.idGrupo 
                and e.idEjercicio = ae.idEj 
                and ae.idGrupo = ? 
                and pg.idProfesor = ?`
                con.query(sql, [datos.idG, datos.user], (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                       
                        var sol = [];
                        var row = {};
                        filas.forEach(e =>{
                            row.titulo = e.titulo;
                            row.idEjercicio = e.idEjercicio;
                            if(e.evaluacion === 0){
                                row.evaluacion = "EJERCICIO";
                            }else{
                                row.evaluacion = "EXAMEN";
                            }
                            row.numIntentos = e.numeroIntentos;
                            var fecha = new Date(e.ini);
                            row.ini = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
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

    listarEjerciciosNoAsignados(datos, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql = `select e.titulo, e.idEjercicio, e.numScriptsSol
                from ejercicio e
                where e.idEjercicio NOT IN (SELECT ae.idEj from altaejercicio ae group by ae.idEj)`
                con.query(sql, (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                       
                        var sol = [];
                        var row = {};
                        filas.forEach(e =>{
                            row.titulo = e.titulo;
                            row.idEjercicio = e.idEjercicio;
                            row.numScripts = e.numScriptsSol;
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
    //lista asignaturas a las que el alumno ha pertenecido años anteriores
    listarEjerciciosAltaAniosPasados(datos, callback){
        var fecha = new Date();
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                var sql = `select * 
                        from grupos g join asignatura a
                        ON a.idAsignatura = g.idAsignatura and g.anio < ?`;
                con.query(sql, [fecha.getFullYear()], (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        // console.log(filas);
                        var sol = [];
                        var row = {};
                        filas.forEach(e =>{
                            row.idAsignatura = e.idAsignatura;
                            row.descripcion = e.descripcion;
                            row.anio = e.anio;
                            row.curso = e.curso;
                            sol.push(row);
                            row = {};
                        });
                        // console.log(sol);
                        callback(undefined, sol);
                    }
                });
                con.release();
            }
        })
    }

    descargarProfesor(datos, callback){
        //console.log(datos);
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{//MYSQL://SELECT creacionTablas FROM `ejercicio` WHERE idEjercicio = 8 //SELECT creacionTablas, solucionProfesor, script FROM `ejercicio` e RIGHT JOIN `scriptspruebas` s ON e.idEjercicio = s.idEjercicio and e.idEjercicio = 11
            con.query(`SELECT creacionTablas, solucionProfesor, script FROM ejercicio e JOIN scriptspruebas s ON e.idEjercicio = s.idEjercicio and e.idEjercicio = ?`,
                [datos], (err, resultado) =>{ 
                    if (!err) {
                        if (resultado.length === 0) 
                            callback(undefined, undefined);
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

    listarEjercicios(callback){
        this.pool.getConnection((err, con )=>{
            if(err){
                callback(err);
            }else{
                var sql = `select * from ejercicio`;
                con.query(sql, (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        //console.log(filas);
                        var row = {};
                        var sol = [];
                        filas.forEach(e =>{
                            row.titulo = e.titulo;
                            row.idEjercicio = e.idEjercicio;
                            sol.push(row);
                            row = {};
                        })
                        callback(undefined, sol);
                    }
                });
                con.release();
            }
        });
    }

    getUltimaEntrega(datos, callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT * FROM ejercicioalumno WHERE idAlumno = ? AND idEjercicio = ?`,
                [datos.idAlumno, datos.idEjercicio], (err, filas)=>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var sol = {};
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
        });
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

    listarBajaEjercicio(id, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql = `select tb1.idEj, e.titulo 
                        from 
                            (select ae.idGrupo, ae.idEj 
                            from altaejercicio ae join profegrupo pg 
                            ON ae.idGrupo = pg.idGrupo and pg.idProfesor = ?) tb1 join ejercicio e 
                        ON e.idEjercicio = tb1.idEj
                        group by tb1.idEj`;
                con.query(sql, [id], (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{

                        var sol = [];
                        var row = {};

                        filas.forEach(e=>{
                            row.idGrupo = e.idGrupo;
                            row.idEj = e.idEj;
                            row.titulo = e.titulo;
                            sol.push(row);
                            row = {};
                        });
                        //console.log(filas);
                        callback(undefined, sol);
                    }
                });
                con.release();
            }
        })
    }

    bajaEjercicio(data, callback){
        console.log(data);
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql = `DELETE FROM altaejercicio where idEj = ? and idGrupo = ?`
                con.query(sql,
                [data.idEjercicio, data.idGrupo], (err) =>{
                    if(err){
                        callback(err, undefined);
                    }
                    else{
                        con.query(`DELETE from ejercicioalumno where idEjercicio = ? and idGrupo = ?`,
                        [data.idEjercicio, data.idGrupo], (err)=>{
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
        });
    }

    entregaRetrasada(idEjercicio, callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT fin FROM altaejercicio WHERE idEj =?`,[idEjercicio],(err, filas)=>{
                    if(err){
                        //console.log("err");
                        callback(err);
                    }else{
                        //if(filas.length === 0){callback(undefined, false);}else{
                        callback(undefined, filas[0].fin);
                    }
                });
                con.release();
            }
        })
    }

    numeroDeIntentos(idEjercicio, callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT numeroIntentos FROM altaejercicio WHERE idEj =?`,[idEjercicio],(err, filas)=>{
                    if(err){
                        //console.log("err");
                        callback(err);
                    }else{
                        //if(filas.length === 0){callback(undefined, false);}else{
                        callback(undefined, filas[0].numeroIntentos);
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
                var sql = `UPDATE ejercicioalumno SET correccionProfesor =?, nota=? WHERE idEjercicio = ? AND idAlumno = ?;`
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

    subirProcedimientoAlumno(datos, resultado, nErr, callback){
        datos = datos.info;
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err, undefined);
            }else{
                con.query(`SELECT count(*) as e from ejercicioalumno where idEjercicio =?`,
                [datos.idEjercicio], (err,sol) =>{
                    if(err){
                        callback(err, undefined);
                    }
                    else{
                        if(sol[0].e===0){
                            var fecha = new Date();
                            con.query(`INSERT INTO ejercicioalumno (idEjercicio,solucion,numFallos,entregaRetrasada,idAlumno,idGrupo,intentos,resultado) VALUES(?,?,?,?,?,?,?,?)`,
                            [datos.idEjercicio, datos.solucion, nErr, fecha, datos.idAlumno,datos.idGrupo,1,resultado], (err) =>{
                                if(err){
                                    console.log("Insert E:");
                                    console.log(err);
                                    callback(err, undefined);
                                }
                                else{
                                    callback(undefined,true);
                                }
                            });
                        }else{
                            var sql = `UPDATE ejercicioalumno SET solucion=?, numFallos=?, entregaRetrasada=?,intentos=?,resultado=? WHERE idEjercicio = ? AND idAlumno = ? ;`
                            con.query(sql,[datos.solucion, nErr, datos.entregaRetrasada, datos.intentos, resultado, datos.idEjercicio,  datos.idAlumno], (err) =>{
                                if(err){
                                    console.log("UPDATE E:");
                                    callback(err, undefined);
                                }
                                else{
                                    //console.log("UPDATE :");
                                    callback(undefined,true);
                                }
                            });
                        }
                    }
                });
            }
            con.release();
        });
    }

    getCreacionTablasPorID(idEjercicio, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`select * from ejercicio where idEjercicio = ?`, [idEjercicio], (err, sol) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var script = sol[0].creacionTablas.split(",");
                        script = new Buffer.from(script[1], 'base64').toString('ascii');
                        callback(undefined, script);
                    }
                });
                con.release();
            }
        })
    }
    
    scriptsPorID(idEjercicio,callback){
        //console.log("datos "+idEjercicio);
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT * FROM scriptspruebas WHERE idEjercicio =?`,[idEjercicio],(err, filas)=>{
                    if(err){
                        console.log("scriptsPorID err");
                        callback(err);
                    }else{
                        if(filas.length === 0){
                            //console.log("query 0");
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
                        //console.log("sol  " + filas);
                        //console.log(filas);
                        var sol = 0;
                        if(filas.length === 0){
                            sol = 0;
                        }else{
                            sol = filas[0].intentos;
                        }
                        callback(undefined, sol);
                    }
                });
                con.release();
            }
        })
    }

    cargarEjerciciosAtrasados(datos, callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                var sql = `select * 
                        from (select * 
                            from ejercicio e join altaejercicio ae 
                            on e.idEjercicio = ae.idEj 
                            where ae.idGrupo = ?) tb1 join profesor p 
                        on p.idProfesor = tb1.idProfesor`;
                con.query(sql, [datos.idG], (err, filas)=>{
                    
                    if(err){
                        callback(err, undefined);
                    }else{

                        var sol = [];
                        var row = {};

                        filas.forEach(e=>{
                            row.titulo = e.titulo;
                            row.autor = e.nombre;
                            row.fecha = e.fecha;
                            row.idEj = e.idEjercicio;
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

    comprobarBorrado(datos, callback){
        // console.log(datos);
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql=`select * from ejercicioalumno ea where ea.idEjercicio = ? and idGrupo = ?`
                con.query(sql, [Number(datos.idEjercicio), Number(datos.idGrupo)], (err, sol) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        //no hay ningun alumno que haya resuelto el ejercicio
                        if(sol.length === 0){
                            callback(err, true);
                        }else{ //al menos hay uno
                            callback(err, false);
                        }
                    }
                });
                con.release();
            }
        })
    }

    getEjercicio(idEjercicio, callback){
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                var sql = `select * from ejercicio where idEjercicio = ?`;
                con.query(sql, [idEjercicio], (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var row = {};

                        row.creacionTablas = new Buffer.from(filas[0].creacionTablas.split(",")[1], 'base64').toString('ascii');
                        row.solucionProfesor = new Buffer.from(filas[0].solucionProfesor.split(",")[1], 'base64').toString('ascii');
                        row.titulo = filas[0].titulo;
                        row.enunciado = filas[0].enunciado;
                        row.scripts = [];

                        var sql2 = `select idPrueba, script from scriptspruebas where idEjercicio = ?`;
                        con.query(sql2, [idEjercicio], (err, sol)=>{
                            if(err){
                                callback(err, undefined);
                            }else{
                                var scr = {};
                                sol.forEach(e =>{
                                    scr.idPrueba = e.idPrueba;
                                    scr.script = new Buffer.from(e.script.split(",")[1], 'base64').toString('ascii');
                                    row.scripts.push(scr);
                                    scr = {};
                                });
                                callback(undefined, row);
                            }
                        });
                        con.release();
                    }
                });
            }
        });
    }

    deleteScripts(idEjercicio, listScripts, callback){
        // console.log(listScripts);
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var lista = [];
                lista.push(idEjercicio);
                var sql=`delete from scriptspruebas where idEjercicio = ? and `;
                for(var i = 0; i < listScripts.length; i++){
                    lista.push(listScripts[i]);
                    sql += 'idPrueba = ?';
                    if(i < listScripts.length - 1){
                        sql += ' and ';
                    }
                }
                // console.log(lista);
                // console.log(sql);
                con.query(sql, lista, (err)=>{
                    if(err){
                        callback(err);
                    }else{
                        callback(undefined);
                    }
                });
                con.release();
            }
        })
    }

    eliminarEjercicio(idEjercicio, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql=`Delete from ejercicio where idEjercicio = ?`
                con.query(sql, [Number(idEjercicio)], (err, sol) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        callback(false, true);
                    }
                });
                con.release();
            }
        })
    }
    solucionScriptsPorfesor(idEjercicio, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql=`SELECT solucionPrueba FROM ejercicio , scriptspruebas WHERE ejercicio.idEjercicio= scriptspruebas.idEjercicio and ejercicio.idEjercicio= ?`
                con.query(sql, [Number(idEjercicio)], (err, sol) =>{
                    if(err){
                        console.log(err);
                        callback(err, undefined);
                    }else{
                        // console.log("profeDAO");
                        // console.log(sol);
                        callback(false, sol);
                    }
                });
                con.release();
            }
        })
    }
    solucionScriptsAlumnos(idEjercicio, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql=`SELECT resultado FROM ejercicioalumno WHERE idEjercicio= ?`
                con.query(sql, [Number(idEjercicio)], (err, sol) =>{
                    if(err){
                        console.log(err);
                        callback(err, undefined);
                    }else{
                        //console.log(sol);
                        callback(false, sol[0].resultado);
                    }
                });
                con.release();
            }
        })
    }

    actualizarEjercicio(data, callback){
        console.log(data);
        this.pool.getConnection((err, con)=>{
            if(err){
                callback(err);
            }else{
                var sql = `UPDATE ejercicio SET creacionTablas = ?, solucionProfesor = ?, numScriptsSol = ?, enunciado = ?, titulo = ?
                WHERE idEjercicio = ?`;
                
                con.query(sql, [data.scriptTablas64, data.scrSolucion64, data.solScriptOracle.length,
                     data.enunciado, data.titulo, data.idEjercicio], (err)=>{
                         if(err){
                             callback(err);
                         }else{
                            //  callback(undefined);
                            var sql2 = `delete from scriptspruebas where idEjercicio = ?`
                             con.query(sql2, [data.idEjercicio], (err)=>{
                                 if(err){
                                     callback(err);
                                 }else{
                                     var sql3 = `insert into scriptspruebas (idEjercicio, idPrueba, script, solucionPrueba) VALUES `;
                                     for(var i = 0; i < data.solScriptOracle.length;i++){
                                         sql3 += `(?, ?, ?, ?)`
                                         if(i != data.solScriptOracle.length - 1){
                                             sql3 += `,`;
                                         }
                                     }
                                    
                                     var variables = [];
                                     for(var j = 0; j < data.listaScriptsTotales.length;j++){
                                         variables.push(data.idEjercicio);
                                         variables.push(j + 1);
                                         variables.push(data.listaScriptsTotales[j]);
                                         variables.push(data.solScriptOracle[j].toString());
                                     }

                                     con.query(sql3, variables, (err)=>{
                                         if(err){
                                             callback(err);
                                         }else{
                                             callback(undefined);
                                         }
                                     })
                                 }
                             });
                         }
                     });
                
            }
        })
    }
}
module.exports = {
    DAOEjercicio: DAOEjercicio
}