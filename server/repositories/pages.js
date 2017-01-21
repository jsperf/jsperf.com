const name = 'repositories/pages';
const table = 'pages';

exports.register = function (server, options, next) {
  const db = server.plugins.db;

  server.expose('create', function (payload) {
    return db.genericQuery('INSERT INTO ?? SET ?', [table, payload]).then((result) => result.insertId);
  });

  server.expose('get', function (fields, where) {
    return db.genericQuery('SELECT ?? FROM ?? WHERE ? LIMIT 1', [fields, table, where]).then((rows) => rows[0]);
  });

  server.expose('getLatestVisible', function (count) {
    // SELECT
    //   p1.id AS pID,
    //   p1.slug AS url,
    //   p1.revision,
    //   p1.title,
    //   p1.published,
    //   p1.updated,
    //   (SELECT COUNT(*) FROM pages WHERE slug = url AND visible = \'y\') AS revisionCount,
    //   (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount
    // FROM pages p1
    // LEFT JOIN pages p2
    // ON
    //   p1.slug = p2.slug AND p1.updated < p2.updated
    // WHERE
    //   p2.updated IS NULL AND p1.visible = \'y\'
    // ORDER BY
    //   p1.updated
    // DESC
    // LIMIT {{count}}

    return db.genericQuery(
      "SELECT p1.id AS pID, p1.slug AS url, p1.revision, p1.title, p1.info, p1.published, p1.updated, (SELECT COUNT(*) FROM pages WHERE slug = url AND visible = 'y') AS revisionCount, (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount FROM pages p1 LEFT JOIN pages p2 ON p1.slug = p2.slug AND p1.updated < p2.updated WHERE p2.updated IS NULL AND p1.visible = 'y' ORDER BY p1.updated DESC LIMIT ?",
      [count]
    );
  });

  server.expose('getLatestVisibleForAuthor', function (author) {
    // SELECT
    //   id AS pID,
    //   slug AS url,
    //   revision,
    //   title,
    //   published,
    //   updated,
    //   author,
    //   (SELECT COUNT(*) FROM pages WHERE slug = url AND visible = 'y') AS revisionCount,
    //   (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount
    // FROM pages
    // WHERE
    //   author LIKE '%{{author}}%'
    //   OR author LIKE '{{author}}'
    //   AND updated IN (SELECT MAX(updated) FROM pages WHERE visible = 'y' GROUP BY slug)
    //   AND visible = 'y'
    // ORDER BY updated DESC

    var wcAuthor = '%' + author + '%';
    var a = author.trim().replace('-', '%');

    return db.genericQuery(
      "SELECT id AS pID, slug AS url, revision, title, published, updated, author, (SELECT COUNT(*) FROM pages WHERE slug = url AND visible = 'y') AS revisionCount, (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount FROM pages WHERE author LIKE ? OR author LIKE ? AND updated IN (SELECT MAX(updated) FROM pages WHERE visible = 'y' GROUP BY slug) AND visible = 'y' ORDER BY updated DESC",
      [wcAuthor, a]
    );
  });

  server.expose('getBySlug', function (slug, rev) {
    server.log(['debug'], `${name}::getBySlug: ${JSON.stringify(arguments)}`);
    // SELECT
    //   *,
    //   (SELECT MAX(revision) FROM pages WHERE slug = {{slug}}) AS maxRev
    // FROM pages
    // WHERE
    //   slug = {{slug}} AND revision = {{rev}}

    return db.genericQuery(
      'SELECT *, (SELECT MAX(revision) FROM ?? WHERE slug = ? ) AS maxRev FROM ?? WHERE slug = ? AND revision = ?',
      [table, slug, table, slug, rev]
    );
  });

  server.expose('getVisibleBySlug', function (slug, rev) {
    server.log(['debug'], `${name}::getVisibleBySlug: ${JSON.stringify(arguments)}`);

    return db.genericQuery(
      'SELECT *, (SELECT MAX(revision) FROM ?? WHERE slug = ? ) AS maxRev FROM ?? WHERE slug = ? AND revision = ? AND visible = ?',
      [table, slug, table, slug, rev, 'y']
    );
  });

  server.expose('find', function (searchTerms) {
    // SELECT * FROM (
    //   SELECT x.id AS pID, x.slug AS url, x.revision, x.title, x.published, x.updated, COUNT(x.slug) AS revisionCount
    //   FROM pages x
    //   WHERE x.title LIKE '%' . searchTerms . '%' OR x.info LIKE '%' . searchTerms . '%'
    //   GROUP BY x.slug
    //   ORDER BY updated DESC
    //   LIMIT 0, 50
    // )
    // y LEFT JOIN (
    //   SELECT t.pageID, COUNT(t.pageID) AS testCount
    //   FROM tests t
    //   GROUP BY t.pageID
    // )
    // z ON z.pageID = y.pID';

    var q = '%' + searchTerms + '%';

    return db.genericQuery(
      'SELECT * FROM (SELECT x.id AS pID, x.slug AS url, x.revision, x.title, x.published, x.updated, COUNT(x.slug) AS revisionCount FROM pages x WHERE x.title LIKE ? OR x.info LIKE ? GROUP BY x.slug ORDER BY updated DESC LIMIT 0, 50) y LEFT JOIN (SELECT t.pageID, COUNT(t.pageID) AS testCount FROM tests t GROUP BY t.pageID) z ON z.pageID = y.pID;',
      [q, q]
    );
  });

  server.expose('findBySlug', function (slug) {
    server.log(['debug'], `${name}::findBySlug: ${JSON.stringify(arguments)}`);

    return db.genericQuery(
      'SELECT published, updated, author, authorEmail, authorURL, revision, visible, title FROM pages WHERE slug = ? ORDER BY published ASC',
      [slug]
    );
  });

  server.expose('findVisibleBySlug', function (slug) {
    server.log(['debug'], `${name}::findBySlug: ${JSON.stringify(arguments)}`);

    return db.genericQuery(
      'SELECT published, updated, author, authorEmail, revision, visible, title FROM pages WHERE slug = ? AND visible = ? ORDER BY published ASC',
      [slug, 'y']
    );
  });

  server.expose('deleteOneRevisionBySlug', function (slug, rev) {
    let queries = [];

    queries.push(db.genericQuery('DELETE FROM tests WHERE pageID IN (SELECT id FROM pages WHERE slug = ? AND revision = ?)', [slug, rev]));
    queries.push(db.genericQuery('DELETE FROM pages WHERE slug = ? AND revision = ?', [slug, rev]));

    return Promise.all(queries).then(function (values) {
      return values[1].affectedRows;
    });
  });

  server.expose('deleteAllRevisionsBySlug', function (slug, rev) {
    let queries = [];

    queries.push(db.genericQuery('DELETE FROM tests WHERE pageID IN (SELECT id FROM pages WHERE slug = ?)', [slug]));
    queries.push(db.genericQuery('DELETE FROM pages WHERE slug = ?', [slug]));

    return Promise.all(queries).then(function (values) {
      return values[1].affectedRows;
    });
  });

  server.expose('getSitemap', function () {
    return db.genericQuery("SELECT id AS pID, revision, slug, title, updated, (SELECT COUNT(*) FROM tests WHERE pageID = pID) AS testCount FROM pages WHERE visible = 'y' ORDER BY updated DESC");
  });

  server.expose('getPopularRecent', function () {
    return db.genericQuery('SELECT id AS pID, slug AS url, author, revision, title, published, updated, hits FROM pages WHERE updated BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW() ORDER BY hits DESC LIMIT 0, 30');
  });

  server.expose('getPopularAllTime', function () {
    return db.genericQuery('SELECT id AS pID, slug AS url, author, revision, title, published, updated, hits FROM pages ORDER BY hits DESC LIMIT 0, 30');
  });

  server.expose('updateHits', function (pageID) {
    return db.genericQuery('UPDATE ?? SET hits = hits + 1 WHERE id = ?', [table, pageID]);
  });

  server.expose('updateById', function (modify, pageID) {
    return db.genericQuery('UPDATE ?? SET ? WHERE id = ?', [table, modify, pageID])
      .then(function (result) {
        return pageID;
      });
  });

  return next();
};

exports.register.attributes = {
  name,
  dependencies: ['db']
};
