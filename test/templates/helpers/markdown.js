"use strict";

var Lab = require("lab");
var Code = require("code");
var proxyquire = require("proxyquire");

function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

var markdown = proxyquire("../../../templates/helpers/markdown", {
  "marked": function() {
    return "<strong>word</strong>";
  },
  "handlebars": {
    SafeString: SafeString
  }
});

var lab = exports.lab = Lab.script();

lab.experiment("Template Helper markdown", function() {

  lab.test("returns marked safe string", function(done) {
    var res = markdown("*word*");

    Code.expect(res.toString()).to.equal("<strong>word</strong>");

    done();
  });
});
