var oracledb = require('oracledb');
//var async = require('async');
var dbConfig = require('./dbconfig.js');
var fs = require("fs");
oracledb.autoCommit= true;
//https://github.com/oracle/node-oracledb/blob/master/examples/example.js
//https://oracle.github.io/node-oracledb/
//NO BORRAR REFERENCIA POR AHORA
async function connect(sql,datos, callback){
  try {
    //console.log(datos);
    let user = datos.nombre + datos.idAlumno;
    //console.log(user);
   await corregirProcedimiento(user,datos.solucion,sql, (err, ok) =>{
     if(err){
       callback(err, undefined);
       return;
     }else{
       callback(undefined, ok);
       return;
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
async function corregirProcedimiento(user,solucion,scripts, callback){//sql tiene la cracion de las tablas, el porcedimiento y los scripts
 
  let conection;
    /*console.log("scripts:"+scripts);
    console.log("user:"+user);
    console.log("solucion:"+solucion);*/

    try {
      conection = await oracledb.getConnection({
        user:  user,
        password: user,
        connectString: 'localhost',
      },
      async function(err, conection) {
        if (err)
          //console.error("conection :"+err);
          callback(err, undefined);
        else{
          await almacenarProcedimineto(user,solucion,scripts, (err, sol)=>{
            if(err){
              callback(err, undefined);
              return;
            }else{
              callback(undefined, sol);
              return;
            }
          });
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

async function almacenarProcedimineto(user,solucion,sql, callback){
 
  var sol = "Hola, estas dentro de almacenar Procedimiento";
  callback(undefined, sol);
  return;
}
module.exports = {
  connect:connect
 
}