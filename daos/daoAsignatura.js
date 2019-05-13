"use strict";
/**
 * Proporciona operaciones para la gestión de asignaturas
 * en la base de datos.
 */
class DAOAsignatura {
   
    constructor(pool) {
        this.pool = pool;
    }

    listarAsignaturas(idProfe, callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`select * from asignatura a join grupos g join profegrupo pg on a.idAsignatura = g.idAsignatura and pg.idGrupo = g.idGrupo and pg.idProfesor = ?`,
                [idProfe], (err, filas)=>{
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
                con.query(`SELECT * FROM asignatura a, grupos g, profeGrupo pg where a.idAsignatura = g.idAsignatura and g.idGrupo = pg.idGrupo AND a.idAsignatura = 1 and anio = '2018' and pg.idProfesor = 1`,
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
        })
    }




}
module.exports = {
    DAOAsignatura: DAOAsignatura
}