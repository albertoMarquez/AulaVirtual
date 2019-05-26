var oracledb = require('oracledb');
//var async = require('async');
var dbConfig = require('./dbconfig.js');
var fs = require("fs");
oracledb.autoCommit= true;
//https://github.com/oracle/node-oracledb/blob/master/examples/example.js
//https://oracle.github.io/node-oracledb/
//NO BORRAR REFERENCIA POR AHORA
async function altaUsuario(usuario, callback){
  //console.log("altaUsuario :"+usuario);
  let connection;
  try {
    connection = await oracledb.getConnection(
      {
        user: 'SYS',
        password: 'SYS',
        connectString: 'localhost',
        privilege: oracledb.SYSDBA
      },
      function(err, connection) {
        if(err){
          console.error("conection :"+err);
          callback(err);
          return;
        }else{
          connection.execute("begin ALTA_USUARIO(:user); end;",
          {user:usuario}, async function(err, sol){
            sol = false;
            if(err){
              console.log("err en alta usuario"+err);
              await connection.close();
              callback(err, sol);
              return;
            }else{
              sol = true;
              await connection.close();
              //console.log("sol en altu usuario"+sol);
              callback(undefined, sol);
              return;
            }
          });
        }
      }
    );      
  } catch (err) {
    console.error("altaUsuario :"+err);
  } finally {
    if(connection){
      try {
        await connection.close();
      }catch(err){
        console.error(" finally altaUsuario :"+err);
      }
    }
  }
}

async function connectProfesor(sql,user,callback){
  try {
    await run(sql,user,(resultado) =>{
      console.log("connect");
      callback(resultado);
      return;
    });//la funcion que le pasamos(oracle.run)
  } catch (err) {
    console.error('connectProfesor() error: ' + err.message);
  }
}

async function run(sql,user,callback){//sql tiene la cracion de las tablas, el porcedimiento y los scripts
  let connection;
  console.log("user en run:"+user);
  try {
    connection = await oracledb.getConnection(
      {
        user: user,
        password: user,
        connectString: 'localhost'
        //privilege: oracledb.SYSDBA
      },
      async function(err,connection){
        if (err)
          console.error("conection :"+err);
        else{
          await createTables(connection,sql[0]);
          await createProcedure(connection,sql[1]);
          await callProcedures(connection,sql,user, async function (sol){
            await connection.close();
            callback(sol);
            return;
          });
        }
      }
    );      
  }catch(err){
    console.error("run :"+err);
  }finally{
    if(connection){
      try{
        await connection.close();
      }catch(err){
        console.error("finally run :"+err);
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
    }
  }
}

async function createProcedure(connection,sql){
  //var sq = sql.replace(/\r|\n|\t|#|COMMIT;|/g, '');
  //console.log(sql);
  try{
    await connection.execute(sql);
  }catch(err){
    console.error("createProcedure : "+err);
  }
}

async function callProcedures(connection,sql,user,callback){
  let resultado = [];
  let sq;
  for(let i = 2; i < sql.length; i++){//Las dos primeras posiciones del array son las tablas y el procedimiento
    console.log(sql[i]);
    sql[i] = sql[i].replace(/PROC_alumno/gi,user);
    sq = sql[i].toString();
    console.log(sq);
    await connection.execute(sq);
    resultado[i-2] = fs.readFileSync('C:/tmp/'+user+'.log');
  }
  callback(resultado);
}

module.exports = {
  connectProfesor:connectProfesor,
  altaUsuario:altaUsuario
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*async function closePoolAndExit() {
  console.log('\nTerminating');
  try {
    // get the pool from the pool cache and close it when no
    // connections are in use, or force it closed after 10 seconds
    let pool = oracledb.getPool();
    await pool.close({drop: true});
    console.log('Pool closed');
    //process.exit(0);
  } catch(err) {
    // Ignore getPool() error, which may occur if multiple signals
    // sent and the pool has already been removed from the cache.
    process.exit(0);
  }
}*/
/*CREATE OR REPLACE PROCEDURE ALTA_USUARIO(user_id VARCHAR2) AS
  BEGIN
    EXECUTE IMMEDIATE 'DROP USER '||user_id||' CASCADE';
    EXCEPTION WHEN OTHERS THEN IF SQLCODE NOT IN (-01918) THEN RAISE; END IF;
    EXECUTE IMMEDIATE 'CREATE USER '||user_id||' IDENTIFIED BY '||user_id;
    EXECUTE IMMEDIATE 'GRANT RESOURCE TO '||user_id;
    EXECUTE IMMEDIATE 'GRANT CONNECT TO '||user_id;
    EXECUTE IMMEDIATE 'GRANT CREATE TRIGGER TO '||user_id;
    EXECUTE IMMEDIATE 'GRANT CREATE SEQUENCE TO '||user_id;
    EXECUTE IMMEDIATE 'GRANT CREATE TABLE TO '||user_id;
    EXECUTE IMMEDIATE 'GRANT CREATE SYNONYM TO '||user_id;
    EXECUTE IMMEDIATE 'GRANT CREATE VIEW TO '||user_id;
    EXECUTE IMMEDIATE 'GRANT debug any procedure, debug connect session TO '||user_id;
    EXECUTE IMMEDIATE 'GRANT EXECUTE ON sys.write_log TO '||user_id;
  END;
   begin
      ALTA_USUARIO('borja');
  end;*/
/*process
  .on('SIGTERM', closePoolAndExit)
  .on('SIGINT',  closePoolAndExit)*/
  /*async function createUser(nombre,id,callback){//sql son los scripts de prueba
  try{
    //ADAPTAR EL CODIGO PARA QUE COJA LOS DATOS CON LOS MISMOS NOMBRES!!!!!!!!!!!!!
    //datos = datos.alumnoAux;
    
    console.log(user);
    await altaUsuario(user,(err, sol) =>{
      console.log("User creado"); 
      if(err){
        callback(err, undefined);
        return;
      }else{
        callback(undefined, user);
        return;
      }        
    });
  }catch(err){
    console.error('createUser() error: ' + err.message);
  }
}*/
