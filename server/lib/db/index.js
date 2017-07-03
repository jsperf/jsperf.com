const path = require('path');
const mysql = require('mysql');
const Umzug = require('umzug');
const Storage = require('./umzugStorage');

exports.register = function (server, options, next) {
  const connectionOptions = {
    host: options.host,
    port: options.port,
    user: options.user,
    password: options.pass,
    database: options.db,
    // query and rows will print to stdout
    debug: options.debug ? ['ComQueryPacket', 'RowDataPacket'] : false,
    charset: 'utf8mb4'
  };

  const logger = function (msg) {
    server.log(['db'], msg);
  };

  const genericQuery = function (query, values) {
    if (values === undefined) {
      values = [];
    }
    return new Promise(function (resolve, reject) {
      const conn = mysql.createConnection(connectionOptions);

      conn.query(query, values, function (err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });

      conn.end(function (err) {
        if (err) {
          logger(err);
        }
      });
    });
  };

  server.expose('escape', mysql.escape);

  server.expose('genericQuery', genericQuery);

  const migrator = new Umzug({
    storage: new Storage({
      genericQuery
    }),
    logger,
    upName: 'up',
    downName: 'down',
    migrations: {
      params: [genericQuery],
      path: path.resolve(__dirname, 'migrations'),
      pattern: /^\d{4}\d{2}\d{2}_[\w-]+\.js$/ // YYYYMMDD_description.js
    }
  });

  migrator.up()
    .then(function (migrations) {
      server.log(['info', 'db'], 'executed ' + migrations.length + ' migrations');

      next();
    })
    .catch(function (err) {
      server.log(['error', 'db', 'migrations'], err);
      next(err);
    });
};

exports.register.attributes = {
  name: 'db'
};
