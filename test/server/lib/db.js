"use strict";

var Lab = require("lab");
var Code = require("code");

var db = require("../../../server/lib/db");

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
  });
});
