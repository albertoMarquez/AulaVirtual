var oracledb = require('oracledb');
//var async = require('async');
var dbConfig = require('./dbconfig.js');
var fs = require("fs");
oracledb.autoCommit= true;
let allErr;
//https://github.com/oracle/node-oracledb/blob/master/examples/example.js
//https://oracle.github.io/node-oracledb/
//NO BORRAR REFERENCIA POR AHORA
/*async function disconnect(conection){
  try{
    //await conection.close();
  }catch(error){
    console.log(error);
  }
}*/
async function connect(tablas,sql,datos, callback){
  try {
    //console.log(datos);
    let user = datos.nombre.toUpperCase() + datos.idAlumno;
    await comprobarProcedimineto(tablas,user,datos.solucion,sql,(err,sol)=>{
      if(err){
        //allErr=allErr+err;
        //console.log("comprobarProcedimineto:"+conection);
        //console.log("comprobarProcedimineto:"+allErr);
        callback(err, sol);
        return;
      }else{
        //console.log("comprobarProcedimineto:"+conection);
        callback(undefined, sol);
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
    let conection;
    //console.log("scripts:"+sql);
    console.log("user:"+user);
    console.log("solucion:\n"+solucion);
    console.log("tablas");
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
          await createTables(conection,tablas);
          await almacenarProcedimineto(conection,solucion);
          //console.log("entre almacenar y corregir"+allErr);
          await corregirProcedimiento(conection,sql, (err, sol)=>{//sql son los scripts para comprobar la solucion
            if(err){
              //allErr=allErr+err;
              //console.log("corregirProcedimiento:"+allErr);
              //console.log(conection);
              callback(allErr, undefined);
            }else{
              //console.log(conection);
              callback(undefined, sol);
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
async function createTables(conection,sql) {
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
    await conection.close();
    allErr = allErr + "\nError al crear las tablas" + err + JSON.stringify(err);
    //console.log("createTables:"+allErr);
  }
}
async function almacenarProcedimineto(conection,solucion){
  //console.log(solucion);
  try {
    await conection.execute(solucion);
  } catch (err) {
    await conection.close();
    //console.log(err);
    allErr = allErr + "\nError al almacenar el procedimineto: " + err + JSON.stringify(err);
    //console.log(err+JSON.stringify(err));
  }
}
async function corregirProcedimiento(connection, sql,callback){
  let resultado =[];
  let sq;
  let errorScript;
  try {
    for(let i = 2; i < sql.length; i++){
      //console.log(sql[i].toString());
      sq = sql[i].toString();
      errorScript = await connection.execute(sq);////CONCATENAR LOS ERRORES DE CADA SCRIPT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      resultado[i-2] = fs.readFileSync('C:/tmp/resultado.log');
      //console.log(resultado[i-2].toString());
    }
  } catch (err) {
    allErr = allErr + "\nError al corregir procedimiento" +  err + JSON.stringify(err);
  }
  //console.log("corregirProcedimiento:"+allErr);
  callback(allErr,resultado);
}
module.exports = {
  connect:connect
}