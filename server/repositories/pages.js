"use strict";

var db = require("../lib/db");

var table = "pages";

var genericQuery = function(q, cb) {
  var conn = db.createConnection();

  conn.query(q, cb);

  conn.end();
};

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
  },

  getLatestVisibleForAuthor: function(author, cb) {
    var conn = db.createConnection();

    // SELECT
    //   id AS pID,
    //   slug AS url,
    //   revision,
    //   title,
    //   published,
    //   updated,
    //   author,
    //   (SELECT COUNT(*) FROM pages WHERE slug = url AND visible = "y") AS revisionCount,
    //   (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount
    // FROM pages
    // WHERE
    //   author LIKE "%{{author}}%"
    //   OR author LIKE "{{author}}"
    //   AND updated IN (SELECT MAX(updated) FROM pages WHERE visible = "y" GROUP BY slug)
    //   AND visible = "y"
    // ORDER BY updated DESC

    var a = author.trim().replace("-", "%");

    conn.query(
      "SELECT id AS pID, slug AS url, revision, title, published, updated, author, (SELECT COUNT(*) FROM pages WHERE slug = url AND visible = \"y\") AS revisionCount, (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount FROM pages WHERE author LIKE \"%" + conn.escape(author) + "%\" OR author LIKE ? AND updated IN (SELECT MAX(updated) FROM pages WHERE visible = \"y\" GROUP BY slug) AND visible = \"y\" ORDER BY updated DESC",
      [a],
      cb
    );

    conn.end();

  },

  getBySlug: function(slug, rev, cb) {
    // SELECT
    //   *,
    //   (SELECT MAX(revision) FROM pages WHERE slug = {{slug}}) AS maxRev
    // FROM pages
    // WHERE
    //   slug = {{slug}} AND revision = {{rev}}

    var conn = db.createConnection();

    conn.query(
      "SELECT *, (SELECT MAX(revision) FROM pages WHERE slug = ?? ) AS maxRev FROM pages WHERE slug = ?? AND rev = ??",
      [slug, slug, rev],
      cb
    );

    conn.end();
  },

  find: function(searchTerms, cb) {
    // SELECT * FROM (
    //   SELECT x.id AS pID, x.slug AS url, x.revision, x.title, x.published, x.updated, COUNT(x.slug) AS revisionCount
    //   FROM pages x
    //   WHERE x.title LIKE "%' . $db->real_escape_string($search) . '%" OR x.info LIKE "%' . $db->real_escape_string($search) . '%"
    //   GROUP BY x.slug
    //   ORDER BY updated DESC
    //   LIMIT 0, 50
    // )
    // y LEFT JOIN (
    //   SELECT t.pageid, COUNT(t.pageid) AS testCount
    //   FROM tests t
    //   GROUP BY t.pageid
    // )
    // z ON z.pageid = y.pID';

    var conn = db.createConnection();
    var q = "%" + searchTerms + "%";

    conn.query(
      "SELECT * FROM (SELECT x.id AS pID, x.slug AS url, x.revision, x.title, x.published, x.updated, COUNT(x.slug) AS revisionCount FROM pages x WHERE x.title LIKE ? OR x.info LIKE ? GROUP BY x.slug ORDER BY updated DESC LIMIT 0, 50) y LEFT JOIN (SELECT t.pageid, COUNT(t.pageid) AS testCount FROM tests t GROUP BY t.pageid) z ON z.pageid = y.pID;",
      [q, q],
      cb
    );

    conn.end();
  },

  getSitemap: function(cb) {
    genericQuery("SELECT id AS pID, revision, slug, title, updated, (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount FROM pages WHERE visible = \"y\" ORDER BY updated DESC", cb);
  },

  getPopularRecent: function(cb) {
    genericQuery("SELECT id AS pID, slug AS url, author, revision, title, published, updated, hits FROM pages WHERE updated BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW() ORDER BY hits DESC LIMIT 0, 30", cb);
  },

  getPopularAllTime: function(cb) {
    genericQuery("SELECT id AS pID, slug AS url, author, revision, title, published, updated, hits FROM pages ORDER BY hits DESC LIMIT 0, 30", cb);
  }
};
