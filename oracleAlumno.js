var oracledb = require('oracledb');
//var async = require('async');
var dbConfig = require('./dbconfig.js');
var fs = require("fs");
oracledb.autoCommit= true;
//https://github.com/oracle/node-oracledb/blob/master/examples/example.js
//https://oracle.github.io/node-oracledb/
//NO BORRAR REFERENCIA POR AHORA
async function connect(sql,datos, conection, callback){
  try {
    let user = datos.nombre + datos.idAlumno.toString();
   await corregirProcedimiento(user,datos.solucion,sql, conection, (err, ok) =>{
     if(err){
       callback(err, undefined);
     }else{
       callback(undefined, ok);
     }
   });
  } catch (err) {
    console.error('init() error: ' + err.message);
  } 
}
/**
 * Coger los scripts del profesor
 * Almacenar el procedimiento en la bd
 * Lanzar los script contra el procedimiento
 * Devolver el resultado(uno o varios ficheros?)
 */
async function corregirProcedimiento(user,solucion,scripts, conection, callback){//sql tiene la cracion de las tablas, el porcedimiento y los scripts
 
    console.log("scripts:"+scripts);
    console.log("user:"+user);
    console.log("solucion:"+solucion);

    try {
      conection = await oracledb.getConnection({
          user: "'" + user + "'",
          password: "'" + user + "'",
          connectString: 'localhost',
        },
        async function(err, conection) {
          if (err)
            console.error("conection :"+err);
          else{
            await almacenarProcedimineto(user,solucion,scripts,conection);
          }
      });      
    } catch (err) {
      console.error("run :"+err);
    } finally {
      if (conection) {
        try {
          // Put the connection back in the pool
          await conection.close();
        } catch (err) {
          console.error(" finally run :"+err);
        }
      }
    }
}

async function almacenarProcedimineto(user,solucion,sql,connection){
  console.log("Hola, estas dentro de almacenar Procedimiento");
}
module.exports = {
  connect:connect
 
}