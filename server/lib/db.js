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
        host: config.get('/mysql/host'),
        port: config.get('/mysql/port'),
        user: config.get('/mysql/user'),
        password: config.get('/mysql/pass'),
        database: config.get('/mysql/db'),
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
