var oracledb = require('oracledb');
//var async = require('async');
var dbConfig = require('./dbconfig.js');
var fs = require("fs");
oracledb.autoCommit= true;
//https://github.com/oracle/node-oracledb/blob/master/examples/example.js
//https://oracle.github.io/node-oracledb/
//NO BORRAR REFERENCIA POR AHORA
function connect(sql,datos,callback){
  try {
    let user = datos.nombre + datos.idAlumno.toString();
    callback("oracleAlumno");
   corregirProcedimiento(user,datos.solucion,sql);
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
async function corregirProcedimiento(user,solucion,scripts){//sql tiene la cracion de las tablas, el porcedimiento y los scripts
    let connection;
    console.log("scripts:"+scripts);
    console.log("user:"+user);
    console.log("solucion:"+solucion);
    try {
      connection = await oracledb.getConnection({
          user: "'" + user + "'",
          password: "'" + user + "'",
          connectString: 'localhost',
        },
        async function(err, connection) {
          if (err)
            console.error("conection :"+err);
          else{
            almacenarProcedimineto(user,solucion,scripts,connection);
            await connection.close();
          }
      });      
    } catch (err) {
      console.error("run :"+err);
    } finally {
      if (connection) {
        try {
          // Put the connection back in the pool
          await onnection.close();
        } catch (err) {
          console.error(" finally run :"+err);
        }
      }
    }
}

function almacenarProcedimineto(user,solucion,sql,connection){
  console.log("Hola, estas dentro de almacenar Procedimiento");
}


module.exports = {
  connect:connect
 
}