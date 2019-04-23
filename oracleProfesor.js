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
    if(datos.usuario == 'alumno'){
      let user = datos.nombre + datos.idAlumno.toString();
      console.log(user);
      await altaUsuario(user);
      callback(resultado);
      //sql son los scripts de prueba
    }
    /*else{
      if(funcion)
        await funcion(sql,(resultado) =>{
        //console.log("connect)");
        callback(resultado);
      });//la funcion que le pasamos(oracle.run)
    }*/
  } catch (err) {
    console.error('init() error: ' + err.message);
  }
}
async function run(sql,callback){//sql tiene la cracion de las tablas, el porcedimiento y los scripts
  let connection;
    try {
      connection = await oracledb.getConnection(
        {
          user: 'SYS',
          password: 'SYS',
          connectString: 'localhost',
          privilege: oracledb.SYSDBA
        },
        async function(err, connection) {
          if (err)
            console.error("conection :"+err);
          else{
            await createTables(connection,sql[0]);
            await createProcedure(connection,sql[1]);
            await callProcedures(connection,sql,(sol)=>{
              callback(sol);
            });
          }
        }
      );      
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
async function createProcedure(connection,sql){
  //var sq = sql.replace(/\r|\n|\t|#|COMMIT;|/g, '');
  //console.log(sql);
  try {
    // Put the connection back in the pool
    await connection.execute(sql);
  } catch (err) {
    console.error("createProcedure : "+err);
  }
}
async function callProcedures(connection, sql,callback){
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //CREARLO EN LA BASE DE DATOS CORRECTAMENTE
async function altaUsuario(usuario){
  console.log("alta");
  let connection;
  try {
    connection = await oracledb.getConnection(
      {
        user: 'SYS',
        password: 'SYS',
        connectString: 'localhost',
        privilege: oracledb.SYSDBA
      },
      async function(err, connection) {
        if (err)
          console.error("conection :"+err);
        else{
          connection.execute("begin ALTA_USUARIO(:user); end;",
           {user:usuario},
          );
        }
      }
    );      
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

module.exports = {
  connect:connect
}