var Lab = require('lab');
var Code = require('code');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var dbStub = {};

var pages = proxyquire('../../../server/repositories/pages', {
  '../lib/db': dbStub
});

var lab = exports.lab = Lab.script();

lab.experiment('Pages Repository', function () {
  const table = 'pages';

  lab.beforeEach(function (done) {
    dbStub.genericQuery = sinon.stub();

    done();
  });

  lab.experiment('create', function () {
    var payload;
    var insertId;

    lab.before(function (done) {
      payload = {
        browserscopeID: 123
      };

      insertId = 1;

      done();
    });

    lab.test('inserts payload', function (done) {
      dbStub.genericQuery.returns(Promise.resolve({ insertId: insertId }));

      pages.create(payload)
      .then(function (newId) {
        Code.expect(
          dbStub.genericQuery.calledWithExactly(
            'INSERT INTO ?? SET ?',
            [
              'pages',
              payload
            ]
          )
        ).to.be.true();
        Code.expect(newId).to.equal(insertId);

        done();
      });
    });

    lab.test('returns an error when query fails', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.returns(Promise.reject(testErr));

      pages.create(payload)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });
  });

  lab.experiment('get', function () {
    var testFields;
    var testWhere;
    var id;

    lab.before(function (done) {
      testFields = 'id';
      testWhere = { slug: 'test' };
      id = 1;

      done();
    });

    lab.test('returns single row', function (done) {
      dbStub.genericQuery.returns(Promise.resolve([{ id: id }]));

      pages.get(testFields, testWhere)
      .then(function (row) {
        Code.expect(
          dbStub.genericQuery.calledWithExactly(
            'SELECT ?? FROM ?? WHERE ? LIMIT 1',
            [
              testFields,
              'pages',
              testWhere
            ]
          )
        ).to.be.true();
        Code.expect(row).to.be.object();
        Code.expect(row.id).to.equal(id);

        done();
      });
    });

    lab.test('returns an error when query fails', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.returns(Promise.reject(testErr));

      pages.get(testFields, testWhere)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });
  });

  lab.experiment('getLatestVisible', function () {
    lab.test('returns number of rows of latest, visible pages', function (done) {
      dbStub.genericQuery.returns(Promise.resolve([]));

      pages.getLatestVisible(250)
      .then(function (rows) {
        Code.expect(rows).to.be.array();

        done();
      });
    });

    lab.test('returns an error when query fails', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.returns(Promise.reject(testErr));

      pages.getLatestVisible(250)
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });
  });

  lab.experiment('getLatestVisibleForAuthor', function () {
    lab.test('returns number of rows of latest, visible pages for author', function (done) {
      dbStub.genericQuery.returns(Promise.resolve([]));

      pages.getLatestVisibleForAuthor('test-author')
      .then(function (rows) {
        Code.expect(rows).to.be.array();

        done();
      });
    });

    lab.test('returns an error when query fails', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.returns(Promise.reject(testErr));

      pages.getLatestVisibleForAuthor('test-author')
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });
  });

  lab.experiment('getBySlug', function () {
    lab.test('returns page given slug', function (done) {
      var slug = 'test-slug';
      var rev = 1;
      dbStub.genericQuery.returns(Promise.resolve({}));

      pages.getBySlug(slug, rev)
      .then(function (page) {
        Code.expect(page).to.be.object();
        Code.expect(dbStub.genericQuery.calledWithExactly(
          'SELECT *, (SELECT MAX(revision) FROM ?? WHERE slug = ? ) AS maxRev FROM ?? WHERE slug = ? AND revision = ?',
          [table, slug, table, slug, rev]
        )).to.be.true();

        done();
      });
    });
  });

  lab.experiment('getVisibleBySlug', () => {
    lab.test('returns page given slug and rev', done => {
      const slug = 'test-slug';
      const rev = 1;
      dbStub.genericQuery.returns(Promise.resolve({}));

      pages.getVisibleBySlug(slug, rev)
        .then(page => {
          Code.expect(page).to.be.object();
          Code.expect(dbStub.genericQuery.calledWithExactly(
            'SELECT *, (SELECT MAX(revision) FROM ?? WHERE slug = ? ) AS maxRev FROM ?? WHERE slug = ? AND revision = ? AND visible = ?',
            [table, slug, table, slug, rev, 'y']
          )).to.be.true();

          done();
        });
    });
  });

  lab.experiment('find', function () {
    lab.test('returns search results', function (done) {
      var searchTerms = 'test query';
      var wc = '%' + searchTerms + '%';
      dbStub.genericQuery.returns(Promise.resolve([]));

      pages.find(searchTerms)
      .then(function (page) {
        Code.expect(page).to.be.array();
        Code.expect(dbStub.genericQuery.calledWithExactly(
          'SELECT * FROM (SELECT x.id AS pID, x.slug AS url, x.revision, x.title, x.published, x.updated, COUNT(x.slug) AS revisionCount FROM pages x WHERE x.title LIKE ? OR x.info LIKE ? GROUP BY x.slug ORDER BY updated DESC LIMIT 0, 50) y LEFT JOIN (SELECT t.pageid, COUNT(t.pageid) AS testCount FROM tests t GROUP BY t.pageid) z ON z.pageid = y.pID;',
          [wc, wc]
        )).to.be.true();

        done();
      });
    });
  });

  lab.experiment('findBySlug', function () {
    lab.test('returns query results', function (done) {
      var slug = 'oh-yea';
      dbStub.genericQuery.returns(Promise.resolve([]));

      pages.findBySlug(slug)
      .then(function (p) {
        Code.expect(p).to.be.array();
        Code.expect(dbStub.genericQuery.calledWithExactly(
          'SELECT published, updated, author, authorEmail, revision, visible, title FROM pages WHERE slug = ? ORDER BY published ASC',
          [slug]
        )).to.be.true();

        done();
      });
    });
  });

  lab.experiment('findVisibleBySlug', () => {
    lab.test('returns query results', done => {
      var slug = 'oh-yea';
      dbStub.genericQuery.returns(Promise.resolve([]));

      pages.findVisibleBySlug(slug)
        .then(p => {
          Code.expect(p).to.be.array();
          Code.expect(dbStub.genericQuery.calledWithExactly(
            'SELECT published, updated, author, authorEmail, revision, visible, title FROM pages WHERE slug = ? AND visible = ? ORDER BY published ASC',
            [slug, 'y']
          )).to.be.true();

          done();
        });
    });
  });

  lab.experiment('getSitemap', function () {
    lab.test('returns an error when query fails', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.returns(Promise.reject(testErr));

      pages.getSitemap()
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('returns tests to use for sitemap', function (done) {
      dbStub.genericQuery.returns(Promise.resolve([]));

      pages.getSitemap()
      .then(function (results) {
        Code.expect(results).to.be.array();

        done();
      });
    });
  });

  lab.experiment('getPopularRecent', function () {
    lab.test('returns an error when query fails', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.returns(Promise.reject(testErr));

      pages.getPopularRecent()
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('returns at most 30 recent popular tests', function (done) {
      dbStub.genericQuery.returns(Promise.resolve(new Array(30)));

      pages.getPopularRecent()
      .then(function (results) {
        Code.expect(results).to.be.array();

        done();
      });
    });
  });

  lab.experiment('getPopularAllTime', function () {
    lab.test('returns an error when query fails', function (done) {
      var testErrMsg = 'testing';
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.returns(Promise.reject(testErr));

      pages.getPopularAllTime()
      .catch(function (err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test('returns at most 30 recent popular tests', function (done) {
      dbStub.genericQuery.returns(Promise.resolve(new Array(30)));

      pages.getPopularAllTime()
      .then(function (results) {
        Code.expect(results).to.be.array();

        done();
      });
    });
  });

  lab.experiment('updateHits', function () {
    lab.test('update query for hits + 1', function (done) {
      var pageID = 1;
      dbStub.genericQuery.returns(Promise.resolve());

      pages.updateHits(pageID)
      .then(function () {
        Code.expect(dbStub.genericQuery.calledWithExactly(
          'UPDATE ?? SET hits = hits + 1 WHERE id = ?',
          [table, pageID]
        )).to.be.true();

        done();
      });
    });
  });

  lab.experiment('update', function () {
    lab.test('generic update query', function (done) {
      var modify = { browserscopeID: 'abc123' };
      var where = { id: 1 };
      dbStub.genericQuery.returns(Promise.resolve());

      pages.update(modify, where)
      .then(function () {
        Code.expect(dbStub.genericQuery.calledWithExactly(
          'UPDATE ?? SET ? WHERE ?',
          [table, modify, where]
        )).to.be.true();

        done();
      });
    });
  });

  lab.experiment('updateById', function () {
    lab.test('generic update query', function (done) {
      var modify = { browserscopeID: 'abc123' };
      var pageID = 1;
      dbStub.genericQuery.returns(Promise.resolve());

      pages.updateById(modify, pageID)
      .then(function () {
        Code.expect(dbStub.genericQuery.calledWithExactly(
          'UPDATE ?? SET ? WHERE id = ?',
          [table, modify, pageID]
        )).to.be.true();

        done();
      });
    });

    lab.test('returns updated pageId', function (done) {
      var modify = { browserscopeID: 'abc123' };
      var pageID = 1;
      dbStub.genericQuery.returns(Promise.resolve());

      pages.updateById(modify, pageID)
      .then(newId => {
        Code.expect(newId).to.equal(pageID);

        done();
      });
    });
  });
});
