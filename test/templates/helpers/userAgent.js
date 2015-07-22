"use strict";

var Lab = require("lab");
var Code = require("code");
var proxyquire = require("proxyquire");

var userAgent = proxyquire("../../../templates/helpers/userAgent", {
  "ua-parser-js": function() {
    return {
      browser: {
        name: "Cool Browser",
        version: 1
      }
    };
  }
});

var lab = exports.lab = Lab.script();

lab.experiment("Template Helper userAgent", function() {

  lab.test("returns browser name and version given a user agent string", function(done) {
    var res = userAgent("pretend that Cool Browser and 1 are extracted from here");
    Code.expect(res).to.equal("Cool Browser 1");

    done();
  });
});
