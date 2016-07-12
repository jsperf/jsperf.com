// TODO make hapi plugin
var mysql = require('mysql');
var config = require('../../config');

module.exports = {
  escape: mysql.escape,
  genericQuery: function (query, values) {
    if (values === undefined) {
      values = [];
    }
    return new Promise(function (resolve, reject) {
      var conn = mysql.createConnection({
        host: process.env.DB_ENV_MYSQL_HOST || 'db',
        port: 3306,
        user: process.env.DB_ENV_MYSQL_USER,
        password: process.env.DB_ENV_MYSQL_PASSWORD,
        database: process.env.DB_ENV_MYSQL_DATABASE,
        // query and rows will print to stdout
        debug: config.get('/debug') ? ['ComQueryPacket', 'RowDataPacket'] : false,
        charset: 'utf8mb4'
      });

      conn.query(query, values, function (err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });

      conn.end();
    });
  }
};
