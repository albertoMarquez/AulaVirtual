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
    console.log("Oracle ALUMNO connect");
    let user = datos.nombre.toUpperCase() + datos.idAlumno;
    await comprobarProcedimineto(tablas,user,datos.solucion,sql,(err,sol)=>{
      if(err){
        //allErr=allErr+err;
        //console.log("comprobarProcedimineto:"+conection);
        //console.log("comprobarProcedimineto:"+allErr);
        callback(err, sol);
        return;
      }else{
        //console.log("comprobarProcedimineto:\n"+sol);
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
  //console.log("user:"+user);
  //console.log("solucion:\n"+solucion);
  //console.log("tablas\n");
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
        await corregirProcedimiento(user,conection,sql, (err, sol)=>{//sql son los scripts para comprobar la solucion
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
async function createTables(connection,sql) {
  sql = sql.replace(/\r|\n|\t|#|COMMIT;|/g, '');
  sql=sql.split(";");
  //console.log(sql);
  var i, aux;
  //console.log(sql);
  try{
    for( i=0; i<sql.length-1;i++){
      aux = sql[i];
      auxx = aux.split(" ");
      //console.log((auxx[0]==="DROP")||(auxx[0]==="drop"));
      //console.log(auxx[0]);
      if((auxx[0]==="DROP")||(auxx[0]==="drop")){
        //console.log("if\n"+aux);
      }else{
        //console.log("else\n"+aux);
        await connection.execute(aux);
        /*if(er)
          console.log("\nNo se pudo cerrar la conexion: " +er);
        else*/
      }
    }
  }catch(err){
    console.log("err al crear las tablas\n"+err);
    allErr = allErr + "\nError al crear las tablas" + JSON.stringify(err);
  }
}

async function almacenarProcedimineto(conection,solucion){
  //console.log(solucion);
  try {
    await conection.execute(solucion);
  } catch (err) {
    let er =await conection.close();
    if(er)
      console.log("\nNo se pudo cerrar la conexion: " +er);
    else
      allErr = allErr + "\nError al almacenar el procedimineto: " + err + JSON.stringify(err);
    //console.log(err+JSON.stringify(err));
  }
}

async function corregirProcedimiento(user,connection, sql,callback){
  let resultado =[];
  let sq;
  let errorScript;
  try {
    for(let i = 0; i < sql.length; i++){//Las dos primeras posiciones del array son las tablas y el procedimiento
      //console.log(sql[i]);
      sql[i] = sql[i].replace(/PROC_alumno/gi,user);
      sq = sql[i].toString();
      //console.log(sq);
      /*errorScript =  */await connection.execute(sq);////CONCATENAR LOS ERRORES DE CADA SCRIPT!!!!      resultado[i-2] = fs.readFileSync('C:/tmp/'+user+'.log');
      resultado[i] = fs.readFileSync('C:/tmp/'+user+'.log');
      //console.log(resultado[i].toString());
    }
  } catch (err) {
    allErr = allErr + "\nError al corregir procedimiento" +  err + JSON.stringify(err);
    console.log("corregirProcedimiento:"+allErr);
  }
  //console.log("corregirProcedimiento:"+allErr);
  callback(allErr,resultado);
}
module.exports = {
  connect:connect
}