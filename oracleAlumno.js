var oracledb = require('oracledb');
//var async = require('async');
var dbConfig = require('./dbconfig.js');
var fs = require("fs");
oracledb.autoCommit= true;
//https://github.com/oracle/node-oracledb/blob/master/examples/example.js
//https://oracle.github.io/node-oracledb/
//NO BORRAR REFERENCIA POR AHORA
async function connect(tablas,sql,datos, callback){
  try {
    //console.log(datos);
    let user = datos.nombre + datos.idAlumno;
    //console.log(user);
   await comprobarProcedimineto(tablas,user,datos.solucion,sql, (err, ok) =>{
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
 * Coger los scripts del profesor y las tablas
 * creamos las tablas para el alumno de ese ejecicio en su bd oracle
 * Almacenar el procedimiento en la bd 
 * Lanzar los script contra el procedimiento
 * Devolver el resultado(uno o varios ficheros?)
 */
async function comprobarProcedimineto(tablas, user,solucion,scripts, callback){//sql tiene la cracion de las tablas, el porcedimiento y los scripts
 
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
          await createTables(connection,tablas);
          await almacenarProcedimineto(conection,solucion);
          await corregirProcedimiento(conection,sql);//sql son los scripts para comprobar la solucion
          /*await almacenarProcedimineto(conection,user,solucion,scripts, (err, sol)=>{
            if(err){
              callback(err, undefined);
              return;
            }else{
              callback(undefined, sol);
              return;
            }
          });*/
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
async function createTables(connection,sql) {
  sql = sql.replace(/\r|\n|\t|#|COMMIT;|/g, '');
  sql=sql.split(";");
  var i, aux;

  for( i=0; i<sql.length-1;i++){
    aux = sql[i];
    if(aux.indexOf("drop") > -1){
      aux=  "BEGIN EXECUTE IMMEDIATE '"+sql[i]+"'; EXCEPTION WHEN OTHERS THEN IF SQLCODE NOT IN (-00942) THEN RAISE; END IF; END;";
    }
    //console.log(aux);
    //else if(aux.indexOf("insert") > -1 || aux.indexOf("INSERT") > -1){
    await connection.execute(aux);
  }
}
async function almacenarProcedimineto(conection,solucion){
  console.log(solucion);
  try {
    await connection.execute(solucion);
  } catch (err) {
    console.error("almacenarProcedimineto : "+err);
  }
}
async function corregirProcedimiento(conection,sql){

}
async function comprobarProcedimineto(conection,user,solucion,sql,callback){
  
  var sol = "Hola, estas dentro de almacenar Procedimiento";
  callback(undefined, sol);
  return;
}
module.exports = {
  connect:connect
 
}