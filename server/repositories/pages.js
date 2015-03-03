"use strict";

var db = require("../lib/db");

var table = "pages";

module.exports = {
  create: function(payload) {
    return new Promise(function(resolve, reject) {
      var conn = db.createConnection();

      conn.query("INSERT INTO ?? SET ?", [table, payload], function(err, result) {
        if (err) {
          reject(err);
        }

        resolve(result.insertId);
      });

      conn.end();
    });
  },

  get: function(fields, where) {
    return new Promise(function(resolve, reject) {
      var conn = db.createConnection();

      conn.query("SELECT ?? FROM ?? WHERE ? LIMIT 1", [fields, table, where], function(err, rows) {
        if (err) {
          reject(err);
        }

        resolve(rows[0]);
      });

      conn.end();
    });
  }
};
