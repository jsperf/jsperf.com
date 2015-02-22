"use strict";

var Code = require("code");
var Lab = require("lab");
var composer = require("../index");

var lab = exports.lab = Lab.script();

lab.experiment("Index", function () {

  lab.test("it composes a server", function (done) {
    composer(function(err, server) {
      Code.expect(server).to.be.an.object();

      done(err);
    });
  });
});
