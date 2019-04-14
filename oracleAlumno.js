var oracledb = require('oracledb');
//var async = require('async');
var dbConfig = require('./dbconfig.js');
var fs = require("fs");
oracledb.autoCommit= true;
//https://github.com/oracle/node-oracledb/blob/master/examples/example.js
//https://oracle.github.io/node-oracledb/
//NO BORRAR REFERENCIA POR AHORA
async function connect(sql,datos,callback){
  try {
    // Create a connection pool which will later be accessed via the
    // pool cache as the 'default' pool.
    await oracledb.createPool({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
     
    });
    console.log('Connection pool started');
    if(datos.usuario == 'alumno'){
      let user = datos.nombre + datos.idAlumno.toString();
      await corregirProcedimiento(user,datos.solucion,sql);
    }/*else{
      await run(sql,(resultado) =>{
        //console.log("connect)");
        callback(resultado);
      });//la funcion que le pasamos(oracle.run)
    }*/
  } catch (err) {
    console.error('init() error: ' + err.message);
  } finally {
    await closePoolAndExit();
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
    console.log("scripts:"+script);
    console.log("user:"+user);
    console.log("solucion:"+solucion);
    try {
      connection = await oracledb.getConnection({
          user: "'"+user+"'",
          password: "'"+user+"'",
          connectString: 'localhost',
        },
        async function(err, connection) {
          if (err)
            console.error("conection :"+err);
          else{
            await almacenarProcedimineto(user,solucion,scripts,connection);
          }
      });      
    } catch (err) {
      console.error("run :"+err);
    } finally {
      if (connection) {
        try {
          // Put the connection back in the pool
          await connection.close();
        } catch (err) {
          console.error(" finally run :"+err);
        }
      }
    }
  }
  async function almacenarProcedimineto(user,solucion,sql,connection){
  
  }
  async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
      // get the pool from the pool cache and close it when no
      // connections are in use, or force it closed after 10 seconds
      let pool = oracledb.getPool();
      await pool.close(10);
      console.log('Pool closed');
      //process.exit(0);
    } catch(err) {
      // Ignore getPool() error, which may occur if multiple signals
      // sent and the pool has already been removed from the cache.
      process.exit(0);
    }
  }