"use strict";

var Lab = require("lab");
var Code = require("code");
var proxyquire = require("proxyquire");

var configStub = {};

var db = proxyquire("../../../server/lib/db", {
  "../../config": configStub
});

var lab = exports.lab = Lab.script();

lab.experiment("Database Lib", function() {

  lab.experiment("createConnection", function() {

    lab.test("returns a MySQL connection", function(done) {
      var conn = db.createConnection();

      Code.expect(conn).to.be.an.object();
      Code.expect(conn).to.include("state");
      Code.expect(conn.state).to.equal("disconnected");
      // connection is made when `connect` or `query` are called

      done();
    });

    lab.test("returns a MySQL connection with debug enabled", function(done) {

      configStub.get = function() { return true; };

      var conn = db.createConnection();

      Code.expect(conn).to.be.an.object();
      Code.expect(conn.config).to.be.an.object();
      Code.expect(conn.config.debug).to.be.array();

      // cleanup
      delete configStub.get;

      done();
    });
  });
});
