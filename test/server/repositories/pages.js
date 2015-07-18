"use strict";

var Lab = require("lab");
var Code = require("code");
var proxyquire = require("proxyquire");
var sinon = require("sinon");

var dbStub = {};

var pages = proxyquire("../../../server/repositories/pages", {
  "../lib/db": dbStub
});

var lab = exports.lab = Lab.script();

lab.experiment("Pages Repository", function() {
  const table = "pages";

  lab.beforeEach(function(done) {
    dbStub.genericQuery = sinon.stub();

    done();
  });

  lab.experiment("create", function() {
    var payload;
    var insertId;

    lab.before(function(done) {
      payload = {
        browserscopeID: 123
      };

      insertId = 1;

      done();
    });

    lab.test("inserts payload", function(done) {
      dbStub.genericQuery.callsArgWith(2, null, { insertId: insertId });

      pages.create(payload, function(err, newId) {

        Code.expect(err).to.be.null();
        Code.expect(
          dbStub.genericQuery.calledWithExactly(
            "INSERT INTO ?? SET ?",
            [
              "pages",
              payload
            ],
            sinon.match.func
          )
        ).to.be.true();
        Code.expect(newId).to.equal(insertId);

        done();
      });

    });

    lab.test("returns an error when query fails", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.callsArgWith(2, testErr);

      pages.create(payload, function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });

    });

  });

  lab.experiment("get", function() {
    var testFields;
    var testWhere;
    var id;

    lab.before(function(done) {
      testFields = "id";
      testWhere = { slug: "test" };
      id = 1;

      done();
    });

    lab.test("returns single row", function(done) {
      dbStub.genericQuery.callsArgWith(2, null, [{ id: id }]);

      pages.get(testFields, testWhere, function(err, row) {

        Code.expect(err).to.be.null();
        Code.expect(
          dbStub.genericQuery.calledWithExactly(
            "SELECT ?? FROM ?? WHERE ? LIMIT 1",
            [
              testFields,
              "pages",
              testWhere
            ],
            sinon.match.func
          )
        ).to.be.true();
        Code.expect(row).to.be.object();
        Code.expect(row.id).to.equal(id);

        done();
      });

    });

    lab.test("returns an error when query fails", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.callsArgWith(2, testErr);

      pages.get(testFields, testWhere, function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });

    });

  });

  lab.experiment("getLatestVisible", function() {

    lab.test("returns number of rows of latest, visible pages", function(done) {
      dbStub.genericQuery.callsArgWith(2, null, []);

      pages.getLatestVisible(250, function(err, rows) {

        Code.expect(err).to.be.null();
        Code.expect(rows).to.be.array();

        done();
      });
    });

    lab.test("returns an error when query fails", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.callsArgWith(2, testErr);

      pages.getLatestVisible(250, function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });
  });

  lab.experiment("getLatestVisibleForAuthor", function() {

    lab.test("returns number of rows of latest, visible pages for author", function(done) {
      dbStub.genericQuery.callsArgWith(2, null, []);

      pages.getLatestVisibleForAuthor("test-author", function(err, rows) {

        Code.expect(err).to.be.null();
        Code.expect(rows).to.be.array();

        done();
      });
    });

    lab.test("returns an error when query fails", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.callsArgWith(2, testErr);

      pages.getLatestVisibleForAuthor("test-author", function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });
  });

  lab.experiment("getBySlug", function() {

    lab.test("returns page given slug", function(done) {
      var slug = "test-slug";
      var rev = 1;
      dbStub.genericQuery.callsArgWith(2, null, {});

      pages.getBySlug(slug, rev, function(err, page) {

        Code.expect(err).to.be.null();
        Code.expect(page).to.be.object();
        Code.expect(dbStub.genericQuery.calledWithExactly(
          "SELECT *, (SELECT MAX(revision) FROM ?? WHERE slug = ? ) AS maxRev FROM ?? WHERE slug = ? AND revision = ?",
          [table, slug, table, slug, rev],
          sinon.match.func
        )).to.be.true();

        done();
      });
    });
  });

  lab.experiment("find", function() {

    lab.test("returns search results", function(done) {
      var searchTerms = "test query";
      var wc = "%" + searchTerms + "%";
      dbStub.genericQuery.callsArgWith(2, null, []);

      pages.find(searchTerms, function(err, page) {

        Code.expect(err).to.be.null();
        Code.expect(page).to.be.array();
        Code.expect(dbStub.genericQuery.calledWithExactly(
          "SELECT * FROM (SELECT x.id AS pID, x.slug AS url, x.revision, x.title, x.published, x.updated, COUNT(x.slug) AS revisionCount FROM pages x WHERE x.title LIKE ? OR x.info LIKE ? GROUP BY x.slug ORDER BY updated DESC LIMIT 0, 50) y LEFT JOIN (SELECT t.pageid, COUNT(t.pageid) AS testCount FROM tests t GROUP BY t.pageid) z ON z.pageid = y.pID;",
          [wc, wc],
          sinon.match.func
        )).to.be.true();

        done();
      });
    });
  });

  lab.experiment("findBySlug", function() {
    lab.test("returns query results", function(done) {
      var slug = "oh-yea";
      dbStub.genericQuery.callsArgWith(2, null, []);

      pages.findBySlug(slug, function(err, p) {
        Code.expect(err).to.be.null();
        Code.expect(p).to.be.array();
        Code.expect(dbStub.genericQuery.calledWithExactly(
            "SELECT published, updated, author, authorEmail, revision, visible, title FROM pages WHERE slug = ? ORDER BY published ASC",
            [slug],
            sinon.match.func
        )).to.be.true();

        done();
      });
    });
  });

  lab.experiment("getSitemap", function() {
    lab.test("returns an error when query fails", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.callsArgWith(1, testErr);

      pages.getSitemap(function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test("returns tests to use for sitemap", function(done) {
      dbStub.genericQuery.callsArgWith(1, null, []);

      pages.getSitemap(function(err, results) {

        Code.expect(err).to.be.null();
        Code.expect(results).to.be.array();

        done();
      });
    });
  });

  lab.experiment("getPopularRecent", function() {
    lab.test("returns an error when query fails", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.callsArgWith(1, testErr);

      pages.getPopularRecent(function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test("returns at most 30 recent popular tests", function(done) {
      dbStub.genericQuery.callsArgWith(1, null, new Array(30));

      pages.getPopularRecent(function(err, results) {

        Code.expect(err).to.be.null();
        Code.expect(results).to.be.array();

        done();
      });
    });
  });

  lab.experiment("getPopularAllTime", function() {
    lab.test("returns an error when query fails", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      dbStub.genericQuery.callsArgWith(1, testErr);

      pages.getPopularAllTime(function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test("returns at most 30 recent popular tests", function(done) {
      dbStub.genericQuery.callsArgWith(1, null, new Array(30));

      pages.getPopularAllTime(function(err, results) {

        Code.expect(err).to.be.null();
        Code.expect(results).to.be.array();

        done();
      });
    });
  });

  lab.experiment("updateHits", function() {
    lab.test("update query for hits + 1", function(done) {
      var pageID = 1;
      dbStub.genericQuery.callsArgWith(2, null);

      pages.updateHits(pageID, function(err) {
        Code.expect(err).to.be.null();

        Code.expect(dbStub.genericQuery.calledWithExactly(
          "UPDATE ?? SET hits = hits + 1 WHERE id = ?",
          [table, pageID],
          sinon.match.func
        )).to.be.true();

        done();
      });
    });
  });
});
