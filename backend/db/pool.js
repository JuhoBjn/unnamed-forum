const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || '',
  password: process.env.MYSQL_ROOT_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || '',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 1000 * 60 * 60,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

module.exports = pool;
