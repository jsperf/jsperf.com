"use strict";

var db = require("../lib/db");

var table = "pages";

module.exports = {
  create: function(payload, cb) {
    var conn = db.createConnection();

    conn.query("INSERT INTO ?? SET ?", [table, payload], function(err, result) {
      if (err) {
        cb(err);
      } else {
        cb(null, result.insertId);
      }
    });

    conn.end();
  },

  get: function(fields, where, cb) {
    var conn = db.createConnection();

    conn.query("SELECT ?? FROM ?? WHERE ? LIMIT 1", [fields, table, where], function(err, rows) {
      if (err) {
        cb(err);
      } else {
        cb(null, rows[0]);
      }
    });

    conn.end();
  }
};
