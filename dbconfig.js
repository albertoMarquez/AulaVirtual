//https://github.com/oracle/node-oracledb/blob/master/examples/dbconfig.js
module.exports = {
    user          : process.env.NODE_ORACLEDB_USER || "SYS",
  
    // Instead of hard coding the password, consider prompting for it,
    // passing it in an environment variable via process.env, or using
    // External Authentication.
    //Profe
    //password      : process.env.NODE_ORACLEDB_PASSWORD || "adbd18",
    password      : process.env.NODE_ORACLEDB_PASSWORD || "SYS",
  
    // For information on connection strings see:
    // https://oracle.github.io/node-oracledb/doc/api.html#connectionstrings
    //Profe
   // connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "192.168.56.101:1521/orcl",
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "localhost",
  
    // Setting externalAuth is optional.  It defaults to false.  See:
    // https://oracle.github.io/node-oracledb/doc/api.html#extauth
    externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
  };