"use strict";
/**
 * Proporciona operaciones para la gestión de asignaturas
 * en la base de datos.
 */
class DAOAsignatura {
   
    constructor(pool) {
        this.pool = pool;
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
    //CArga todas las asignaturas
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
                        //console.log("no ha podido borrar");
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
    //lista las asignaturas de un profesor a partir del curso actual
    listarAsignaturas(idProfe, callback){
        var fecha = new Date();
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql = `select * 
                        from asignatura a join grupos g join profegrupo pg 
                        on a.idAsignatura = g.idAsignatura 
                        and pg.idGrupo = g.idGrupo 
                        and pg.idProfesor = ? 
                        and g.anio >= ?
                        group by g.idAsignatura`;
                con.query(sql,
                [idProfe, fecha.getFullYear()], (err, filas)=>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var sol = [];
                        var asig = {};

                        filas.forEach(e => {
                            asig.descripcion = e.descripcion;
                            asig.curso = e.curso;
                            asig.id = e.idAsignatura;
                            sol.push(asig);
                            asig = {};
                        });

                        callback(undefined, sol);

                    }
                });
                con.release();
            }
        });
    }

    listarAsignaturasEjerEnGrupo(datos, callback){
        var fecha = new Date();
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql = `select * 
                from asignatura a join grupos g join profegrupo pg
                on a.idAsignatura = g.idAsignatura 
                and pg.idGrupo = g.idGrupo 
                and pg.idProfesor = ?
                and g.anio = ?
                and pg.idGrupo in (select ae.idGrupo from altaEjercicio ae where idEj = ?)
                group by g.idAsignatura`;
                con.query(sql,
                [datos.id, fecha.getFullYear(), datos.idE], (err, filas)=>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var sol = [];
                        var asig = {};

                        filas.forEach(e => {
                            asig.descripcion = e.descripcion;
                            asig.curso = e.curso;
                            asig.id = e.idAsignatura;
                            sol.push(asig);
                            asig = {};
                        });

                        callback(undefined, sol);

                    }
                });
                con.release();
            }
        });
    }

    listarCursoGrupo(idAsignatura, idProfe, callback){ //dada un id de asignatura lista curso y grupo
        var f = new Date();
        var anioHoy = f.getFullYear();
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT * FROM asignatura a, grupos g, profeGrupo pg where a.idAsignatura = g.idAsignatura and g.idGrupo = pg.idGrupo AND a.idAsignatura = ? and anio >= ? and pg.idProfesor = ?`,
                 [idAsignatura, anioHoy, idProfe],
                (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var row = {};
                        var sol = [];

                        filas.forEach(e =>{
                            row.anio = e.anio;
                            row.curso = e.curso;
                            row.idGrupo = e.idGrupo;
                            row.grupo = e.grupo;
                            sol.push(row);
                            row = {};
                        })

                        callback(undefined, sol);
                    }
                })
            }
        });
    }

    listarCursoGrupoSinAlumnos(idAsignatura, idProfe, callback){ //dada un id de asignatura lista curso y grupo
        var f = new Date();
        var anioHoy = f.getFullYear();
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql = `SELECT * 
                FROM asignatura a, grupos g, profeGrupo pg 
                where a.idAsignatura = g.idAsignatura 
                and g.idGrupo = pg.idGrupo
                AND a.idAsignatura = ? 
                and anio >= ? 
                and pg.idProfesor = ?
                and g.idGrupo NOT IN (select a.idGrupo from alumno a)`
                con.query(sql,
                 [idAsignatura, anioHoy, idProfe],
                (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var row = {};
                        var sol = [];

                        filas.forEach(e =>{
                            row.anio = e.anio;
                            row.curso = e.curso;
                            row.idGrupo = e.idGrupo;
                            row.grupo = e.grupo;
                            sol.push(row);
                            row = {};
                        })

                        callback(undefined, sol);
                    }
                })
            }
        });
    }

    listarCursoGrupoNoAlta(data, callback){ 
        var f = new Date();
        var anioHoy = f.getFullYear();
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT * 
                FROM asignatura a, grupos g, profeGrupo pg 
                where a.idAsignatura = g.idAsignatura 
                and g.idGrupo = pg.idGrupo 
                AND a.idAsignatura = ? 
                and anio = ? 
                and pg.idProfesor = ?
                and pg.idGrupo NOT IN (select idGrupo from altaEjercicio where idEj = ?)`,
                 [data.idA, anioHoy, data.idP, data.idE],
                (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var row = {};
                        var sol = [];

                        filas.forEach(e =>{
                            row.anio = e.anio;
                            row.curso = e.curso;
                            row.idGrupo = e.idGrupo;
                            row.grupo = e.grupo;
                            sol.push(row);
                            row = {};
                        })
                        callback(undefined, sol);
                    }
                })
            }
        })
    }

    listarCursoGrupoEjerAlta(data, callback){
        var f = new Date();
        var anioHoy = f.getFullYear();
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql = `SELECT * 
                            FROM asignatura a, grupos g, profeGrupo pg 
                            where a.idAsignatura = g.idAsignatura 
                            and g.idGrupo = pg.idGrupo 
                            AND a.idAsignatura = ?
                            and anio = ?
                            and pg.idProfesor = ?
                            and pg.idGrupo IN (select idGrupo from altaejercicio ae where idEj = ?)`;
                con.query(sql,
                 [data.idA, anioHoy, data.idP, data.idE],
                (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var row = {};
                        var sol = [];

                        filas.forEach(e =>{
                            row.anio = e.anio;
                            row.curso = e.curso;
                            row.idGrupo = e.idGrupo;
                            row.grupo = e.grupo;
                            sol.push(row);
                            row = {};
                        })
                       
                        callback(undefined, sol);
                    }
                })
            }
        });
    }

    listarCursoGrupoAlumnoAniosPasados(data, callback){
        var fecha = new Date();
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                var sql=`select * from grupos g where g.anio < ?
                 and g.idAsignatura = ?`;
                con.query(sql, [fecha.getFullYear(), data.idA], (err, filas)=>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var sol = [];
                        var row = {};
                        filas.forEach(e =>{
                            row.grupo = e.grupo;
                            row.idGrupo = e.idGrupo;
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
    DAOAsignatura: DAOAsignatura
}