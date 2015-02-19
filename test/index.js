"use strict";

var Code = require("code");
var Lab = require("lab");
var server = require("../index");

var lab = exports.lab = Lab.script();

lab.experiment("Index", function () {

  lab.before(function (done) {
    done();
  });

  lab.beforeEach(function (done) {
    done();
  });

  lab.test("main endpoint returns hello world", function (done) {
    server.inject({
      method: "GET",
      url: "/"
    }, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.equal("Hello, world!");

      done();
    });
  });
});
