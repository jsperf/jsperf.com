"use strict";

var Lab = require("lab");
var Code = require("code");

var error = require("../../../templates/helpers/error");

var lab = exports.lab = Lab.script();

lab.experiment("Template Helper error", function() {

  lab.test("returns span with error class", function(done) {
    var safe = error("msg", { hash: {} });
    Code.expect(safe).to.be.object();
    Code.expect(safe.string).to.equal("<span class=\"error\">msg</span>");

    done();
  });

  lab.test("returns tag with error class", function(done) {
    var safe = error("msg", { hash: { tag: "p" } });
    Code.expect(safe).to.be.object();
    Code.expect(safe.string).to.equal("<p class=\"error\">msg</p>");

    done();
  });
});
