/*
  NAME
    dbmsoutput.js
  DESCRIPTION
    Shows two methods of displaying PL/SQL DBMS_OUTPUT in node-oracledb.
    The second method depends on these PL/SQL objects:
      create or replace type dorow as table of varchar2(32767);
      /
      show errors
      create or replace function mydofetch return dorow pipelined is
        line varchar2(32767);
        status integer;
        begin loop
          dbms_output.get_line(line, status); 
          exit when status = 1;
          pipe row (line);
        end loop;
      return; end;
      /
      show errors
*/
//https://blogs.oracle.com/opal/using-dbmsoutput-with-nodejs-and-node-oracledb
'use strict';
var async = require('async');
var oracledb = require('oracledb');
var dbconfig = require('./dbconfig.js');
oracledb.createPool(
  dbconfig,
    function(err, pool) {
        if (err)
        console.error(err.message)
        else
        doit(pool);
    });
    var doit = function(pool) {
    async.waterfall(
    [
      function(cb) {
        pool.getConnection(cb);
      },
      // Tell the DB to buffer DBMS_OUTPUT
      enableDbmsOutput,
      // Method 1: Fetch a line of DBMS_OUTPUT at a time
      createDbmsOutput,
      fetchDbmsOutputLine,
      // Method 2: Use a pipelined query to get DBMS_OUTPUT 
      //createDbmsOutput,
      function(conn, cb) {
        executeSql(
          conn,
          "select * from table(mydofetch())", [], { resultSet: true}, cb);
      },
      printQueryResults
    ],
    function (err, conn) {
    if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
    conn.release(
        function (err) { 
            if (err) console.error(err.message);
            let pool = oracledb.getPool();
            pool.close(10);
        });
    }
  )
};
var enableDbmsOutput = function (conn, cb) {
  conn.execute(
    "begin dbms_output.enable(null); end;",
    function(err) { return cb(err, conn) });
}
var createDbmsOutput = function (conn, cb) {
  conn.execute(
    `CREATE OR REPLACE PROCEDURE NoticiasMasVistas(p_anio NUMBER) IS 
        v_IdPer ej_periodico.IdPer%TYPE;
        v_numNoticias INTEGER;
      CURSOR cPeriodico IS
        SELECT p.Nombre, p.IdPer FROM ej_periodico p;

      CURSOR cNoticiasMes IS
        SELECT EXTRACT(MONTH FROM n.FechaPub) mes, n.Titular, n.NumVisitas
          FROM ej_noticia n 
          WHERE EXTRACT(YEAR FROM n.FechaPub) = p_anio
          AND n.IdPer = v_IdPer
          AND n.NumVisitas = (SELECT MAX(n2.NumVisitas) 
            FROM ej_noticia n2
            WHERE EXTRACT(YEAR FROM n2.FechaPub) = p_anio
            AND n2.IdPer = n.IdPer
            AND EXTRACT(MONTH FROM n2.FechaPub) =  EXTRACT(MONTH FROM n.FechaPub));
      BEGIN
      DBMS_OUTPUT.PUT_LINE('NOTICIAS MAS VISITADAS ' || p_anio);
      FOR rPeriodico IN cPeriodico LOOP
        DBMS_OUTPUT.PUT_LINE('Perdiodico : ' || rPeriodico.Nombre);
        v_IdPer := rPeriodico.IdPer;
        v_numNoticias := 0;
        FOR rNoticiasMes IN cNoticiasMes LOOP
          v_numNoticias := v_numNoticias + 1;
          DBMS_OUTPUT.PUT_LINE('  Mes: ' || TO_CHAR(rNoticiasMes.mes,'99') ||
            ': ' || RPAD(rNoticiasMes.Titular,70));
          DBMS_OUTPUT.PUT_LINE('            ' || rNoticiasMes.numVisitas || ' Visitas.');
        END LOOP;
          IF v_numNoticias = 0 THEN
          DBMS_OUTPUT.PUT_LINE('  No se han publicado noticias durante 2018');
          END IF;
      END LOOP;
    END;`,
    function(err) { return cb(err, conn) });
}
var fetchDbmsOutputLine = function (conn, cb) {
  conn.execute(
    "begin NoticiasMasVistas(2018); end;",
    {},
    function(err, result) {
      if (err) {
        return cb(err, conn);
      } else if (result.outBinds.st == 1) {
        return cb(null, conn);  // no more output
      } else {
        console.log(result.outBinds.ln);
        return fetchDbmsOutputLine(conn, cb);
      }
    });
  }
var executeSql = function (conn, sql, binds, options, cb) {
  conn.execute(
    sql, binds, options,
    function (err, result) {
      if (err)
        cb(err, conn)
      else
        cb(null, conn, result);
    });
}
var printQueryResults = function(conn, result, cb) {
  if (result.resultSet) {
    fetchOneRowFromRS(conn, result.resultSet, cb);
  } else if (result.rows && result.rows.length > 0) {
    console.log(result.rows);
    return cb(null, conn);
  } else {
    console.log("No results");
    return cb(null, conn);
  }
}
function fetchOneRowFromRS(conn, resultSet, cb) {
  resultSet.getRow(  // note: getRows would be more efficient
    function (err, row) {
      if (err) {
        cb(err, conn);
      } else if (row) {
        console.log(row);
        fetchOneRowFromRS(conn, resultSet, cb);
      } else {
        cb(null, conn);
      }
    });
}