"use strict";
/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class DAOAsignatura {
   
    constructor(pool) {
        this.pool = pool;
    }

    listarAsignaturas(callback){
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT * FROM asignatura`, (err, filas)=>{
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

    listarCursoGrupo(id, callback){ //dada un id de asignatura lista curso y grupo
        this.pool.getConnection((err, con) =>{
            if(err){
                callback(err);
            }else{
                con.query(`SELECT * FROM asignatura a, grupos g where a.idAsignatura = g.idAsignatura AND a.idAsignatura = ?`, [id],
                (err, filas) =>{
                    if(err){
                        callback(err, undefined);
                    }else{
                        var row = {};
                        var sol = [];

                        filas.forEach(e =>{
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