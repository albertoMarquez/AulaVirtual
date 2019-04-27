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
async function comprobarProcedimineto(tablas, user,solucion,sql, callback){//sql tiene la cracion de las tablas, el porcedimiento y los scripts
    let allErr;
    let conection;
    console.log("scripts:"+scripts);
    console.log("user:"+user);
    console.log("solucion:"+solucion);
    //console.log("tablas");
    //console.log(tablas);
    try {
      conection = await oracledb.getConnection({
        user:  user,
        password: user,
        connectString: 'localhost',
      },
      async function(err, conection) {
        if (err)
          callback(err, undefined);
        else{
          await createTables(conection,tablas,allErr);
          await almacenarProcedimineto(conection,solucion,allErr);
          console.log(allErr);
          await corregirProcedimiento(conection,sql, (err, sol)=>{//sql son los scripts para comprobar la solucion
            if(err){
              callback(allErr+err, undefined);
              return;
            }else{
              console.log(sol);
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
          await conection.close();
        } catch (err) {
          console.error(" finally run :"+err);
        }
      }
    }
}
async function createTables(conection,sql,allErr) {
  sql = sql.replace(/\r|\n|\t|#|COMMIT;|/g, '');
  sql=sql.split(";");
  var i, aux;
  try {
    for( i=0; i<sql.length-1;i++){
      aux = sql[i];
      if(aux.indexOf("drop") > -1){
        aux=  "BEGIN EXECUTE IMMEDIATE '"+sql[i]+"'; EXCEPTION WHEN OTHERS THEN IF SQLCODE NOT IN (-00942) THEN RAISE; END IF; END;";
      }
      await conection.execute(aux);
    }
  } catch (err) {
    allErr = allErr+err;
  }
}
async function almacenarProcedimineto(conection,solucion, allErr){
  console.log(solucion);
  try {
    await conection.execute(solucion);
  } catch (err) {
    allErr = allErr+err;
  }
}
async function corregirProcedimiento(connection, sql,callback){
  let resultado =[];
  let sq;
  for(let i = 2; i < sql.length; i++){
    //console.log(sql[i].toString());
    sq = sql[i].toString();
    await connection.execute(sq);
    resultado[i-2] = fs.readFileSync('C:/tmp/resultado.log');
    //console.log(resultado[i-2].toString());
  }
  callback(resultado);
}
module.exports = {
  connect:connect
}