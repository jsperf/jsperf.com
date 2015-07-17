"use strict";

var Lab = require("lab");
var Code = require("code");
var proxyquire = require("proxyquire");
var sinon = require("sinon");

var dbStub = {};

var comments = proxyquire("../../../server/repositories/comments", {
  "../lib/db": dbStub
});

var lab = exports.lab = Lab.script();

lab.experiment("Comments Repository", function() {
  var queryStub;

  lab.before(function(done) {
    dbStub.createConnection = function() {

      return {
        query: queryStub,
        escape: function(val) {
          return "`" + val + "`";
        },
        end: function() {}
      };
    };

    done();
  });

  lab.beforeEach(function(done) {
    queryStub = sinon.stub();

    done();
  });

  lab.experiment("findByPageID", function() {
    lab.test("selects all from comments where pageID", function(done) {
      var pageID = 1;
      queryStub.callsArgWith(2, null, []);

      comments.findByPageID(pageID, function(err) {
        Code.expect(err).to.be.null();
        Code.expect(
          queryStub.calledWithExactly(
            "SELECT * FROM ?? WHERE pageID = ? ORDER BY published ASC",
            ["comments", pageID],
            sinon.match.func
          )
        ).to.be.true();

        done();
      });
    });
  });
});
