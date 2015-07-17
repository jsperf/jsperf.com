"use strict";

var debug = require("debug")("jsperf:repositories:comments");
var db = require("../lib/db");

var table = "comments";

module.exports = {
  findByPageID: function(pageID, cb) {
    debug("findByPageID", arguments);
    var conn = db.createConnection();

    conn.query(
      "SELECT * FROM ?? WHERE pageID = ? ORDER BY published ASC",
      [table, pageID],
      cb
    );

    conn.end();
  }
};
