"use strict";

var db = require("../lib/db");

var table = "tests";

module.exports = {
  bulkCreate: function(pageID, tests, cb) {
    var conn = db.createConnection();

    var columns = ["pageID", "title", "defer", "code"];

    var values = [];
    for(var i = 0, tl = tests.length; i < tl; i++) {
      var test = tests[i];
      values.push("(" + pageID + ", " + conn.escape(test.title) + ", " + conn.escape(test.defer) + ", " + conn.escape(test.code) + ")");
    }

    values = values.join(", ");

    conn.query("INSERT INTO ?? (??) VALUES " + values, [table, columns], function(err, result) {
      if (err) {
        cb(err);
      } else if (result.affectedRows !== tests.length) {
        cb(new Error("Not all tests inserted"));
      } else {
        cb(null);
      }
    });

    conn.end();
  }
};
