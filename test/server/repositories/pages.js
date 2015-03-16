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
  var queryStub;

  lab.beforeEach(function(done) {
    queryStub = sinon.stub();

    done();
  });

  lab.before(function(done) {
    dbStub.createConnection = function() {

      return {
        query: queryStub,
        end: function() {}
      };
    };

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
      queryStub.callsArgWith(2, null, { insertId: insertId });

      pages.create(payload, function(err, newId) {

        Code.expect(err).to.be.null();
        Code.expect(
          queryStub.calledWithExactly(
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

      queryStub.callsArgWith(2, testErr);

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
      queryStub.callsArgWith(2, null, [{ id: id }]);

      pages.get(testFields, testWhere, function(err, row) {

        Code.expect(err).to.be.null();
        Code.expect(
          queryStub.calledWithExactly(
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

      queryStub.callsArgWith(2, testErr);

      pages.get(testFields, testWhere, function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });

    });

  });

  lab.experiment("getLatestVisible250", function() {

    lab.test("returns up to 250 rows of latest, visible pages", function(done) {
      queryStub.callsArgWith(1, null, []);

      pages.getLatestVisible250(function(err, rows) {

        Code.expect(err).to.be.null();
        Code.expect(rows).to.be.array();

        done();
      });
    });

    lab.test("returns an error when query fails", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      queryStub.callsArgWith(1, testErr);

      pages.getLatestVisible250(function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });
  });
});
