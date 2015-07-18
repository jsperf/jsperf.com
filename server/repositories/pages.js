"use strict";

var debug = require("debug")("jsperf:repositories:pages");
var db = require("../lib/db");

const table = "pages";

module.exports = {
  create: function(payload, cb) {
    db.genericQuery("INSERT INTO ?? SET ?", [table, payload], function(err, result) {
      if (err) {
        cb(err);
      } else {
        cb(null, result.insertId);
      }
    });
  },

  get: function(fields, where, cb) {
    db.genericQuery("SELECT ?? FROM ?? WHERE ? LIMIT 1", [fields, table, where], function(err, rows) {
      if (err) {
        cb(err);
      } else {
        cb(null, rows[0]);
      }
    });
  },

  getLatestVisible: function(count, cb) {
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

    db.genericQuery(
      "SELECT p1.id AS pID, p1.slug AS url, p1.revision, p1.title, p1.info, p1.published, p1.updated, (SELECT COUNT(*) FROM pages WHERE slug = url AND visible = \"y\") AS revisionCount, (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount FROM pages p1 LEFT JOIN pages p2 ON p1.slug = p2.slug AND p1.updated < p2.updated WHERE p2.updated IS NULL AND p1.visible = \"y\" ORDER BY p1.updated DESC LIMIT ?",
      [count],
      cb
    );
  },

  getLatestVisibleForAuthor: function(author, cb) {
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

    var wcAuthor = "%" + author + "%";
    var a = author.trim().replace("-", "%");

    db.genericQuery(
      "SELECT id AS pID, slug AS url, revision, title, published, updated, author, (SELECT COUNT(*) FROM pages WHERE slug = url AND visible = \"y\") AS revisionCount, (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount FROM pages WHERE author LIKE ? OR author LIKE ? AND updated IN (SELECT MAX(updated) FROM pages WHERE visible = \"y\" GROUP BY slug) AND visible = \"y\" ORDER BY updated DESC",
      [wcAuthor, a],
      cb
    );
  },

  getBySlug: function(slug, rev, cb) {
    debug("getBySlug", arguments);
    // SELECT
    //   *,
    //   (SELECT MAX(revision) FROM pages WHERE slug = {{slug}}) AS maxRev
    // FROM pages
    // WHERE
    //   slug = {{slug}} AND revision = {{rev}}

    db.genericQuery(
      "SELECT *, (SELECT MAX(revision) FROM ?? WHERE slug = ? ) AS maxRev FROM ?? WHERE slug = ? AND revision = ?",
      [table, slug, table, slug, rev],
      cb
    );
  },

  find: function(searchTerms, cb) {
    // SELECT * FROM (
    //   SELECT x.id AS pID, x.slug AS url, x.revision, x.title, x.published, x.updated, COUNT(x.slug) AS revisionCount
    //   FROM pages x
    //   WHERE x.title LIKE "%' . searchTerms . '%" OR x.info LIKE "%' . searchTerms . '%"
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

    var q = "%" + searchTerms + "%";

    db.genericQuery(
      "SELECT * FROM (SELECT x.id AS pID, x.slug AS url, x.revision, x.title, x.published, x.updated, COUNT(x.slug) AS revisionCount FROM pages x WHERE x.title LIKE ? OR x.info LIKE ? GROUP BY x.slug ORDER BY updated DESC LIMIT 0, 50) y LEFT JOIN (SELECT t.pageid, COUNT(t.pageid) AS testCount FROM tests t GROUP BY t.pageid) z ON z.pageid = y.pID;",
      [q, q],
      cb
    );
  },

  findBySlug: function(slug, cb) {
    debug("findBySlug", arguments);

    db.genericQuery(
      "SELECT published, updated, author, authorEmail, revision, visible, title FROM pages WHERE slug = ? ORDER BY published ASC",
      [slug],
      cb
    );
  },

  getSitemap: function(cb) {
    db.genericQuery("SELECT id AS pID, revision, slug, title, updated, (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount FROM pages WHERE visible = \"y\" ORDER BY updated DESC", cb);
  },

  getPopularRecent: function(cb) {
    db.genericQuery("SELECT id AS pID, slug AS url, author, revision, title, published, updated, hits FROM pages WHERE updated BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW() ORDER BY hits DESC LIMIT 0, 30", cb);
  },

  getPopularAllTime: function(cb) {
    db.genericQuery("SELECT id AS pID, slug AS url, author, revision, title, published, updated, hits FROM pages ORDER BY hits DESC LIMIT 0, 30", cb);
  },

  updateHits: function(pageID, cb) {
    db.genericQuery("UPDATE ?? SET hits = hits + 1 WHERE id = ?", [table, pageID], cb);
  }
};
