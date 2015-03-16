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
  },

  getLatestVisible: function(count, cb) {
    var conn = db.createConnection();

    // SELECT
    //   p1.id AS pID,
    //   p1.slug AS url,
    //   p1.revision,
    //   p1.title,
    //   p1.published,
    //   p1.updated,
    //   (SELECT COUNT(*) FROM pages WHERE slug = url AND visible = \"y\") AS revisionCount,
    //   (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount
    // FROM pages p1
    // LEFT JOIN pages p2
    // ON
    //   p1.slug = p2.slug AND p1.updated < p2.updated
    // WHERE
    //   p2.updated IS NULL AND p1.visible = \"y\"
    // ORDER BY
    //   p1.updated
    // DESC
    // LIMIT {{count}}

    conn.query(
      "SELECT p1.id AS pID, p1.slug AS url, p1.revision, p1.title, p1.info, p1.published, p1.updated, (SELECT COUNT(*) FROM pages WHERE slug = url AND visible = \"y\") AS revisionCount, (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount FROM pages p1 LEFT JOIN pages p2 ON p1.slug = p2.slug AND p1.updated < p2.updated WHERE p2.updated IS NULL AND p1.visible = \"y\" ORDER BY p1.updated DESC LIMIT ?",
      [count],
      cb
    );

    conn.end();
  }
};
