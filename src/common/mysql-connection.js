const mysql = require('mysql');
const util = require('util');
const constants = require('./constants');

const pool = mysql.createPool(constants.MYSQL_DSN);
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('No access to database.');
    }
  }
  if (connection) {
    connection.release();
  }
});
pool.query = util.promisify(pool.query);
module.exports = pool;
