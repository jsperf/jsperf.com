"use strict";

var Lab = require("lab");
var Code = require("code");
var sinon = require("sinon");

var compare = require("../../../templates/helpers/compare");

var lab = exports.lab = Lab.script();

lab.experiment("Template Helper compare", function() {

  lab.test("throws error if unsupported operator", function(done) {
    try {
      compare(1, 2, { hash: { operator: "!" } });
    } catch (e) {
      Code.expect(e.message).to.include("Unsupported operator");
    }

    done();
  });

  lab.test("calls options fn if operator evaluates true", function(done) {
    var fnStub = sinon.stub();

    compare(2, 2, {
      hash: { operator: "===" },
      fn: fnStub
    });

    Code.expect(fnStub.called).to.be.true();

    done();
  });

  lab.test("calls options inverse if operator evaluates false", function(done) {
    var inStub = sinon.stub();

    compare(2, 1, {
      hash: { operator: "===" },
      inverse: inStub
    });

    Code.expect(inStub.called).to.be.true();

    done();
  });

});
