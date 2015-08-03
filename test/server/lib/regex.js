"use strict";

var Lab = require("lab");
var Code = require("code");

var regex = require("../../../server/lib/regex");

var lab = exports.lab = Lab.script();

lab.experiment("Regex Lib", function() {

  lab.experiment("url", function() {

    lab.test("is a string", function(done) {

      Code.expect(regex.url).to.be.a.string();

      done();
    });

    lab.test("matches valid url", function(done) {
      var re = new RegExp(regex.url);

      Code.expect(re.test("http://user:pass@www.example.com:80/path")).to.be.true();

      done();
    });

    lab.test("does not match invalid url", function(done) {
      var re = new RegExp(regex.url);

      Code.expect(re.test("this.is.not.a.url")).to.be.false();

      done();
    });
  });

  lab.experiment("slug", function() {

    lab.test("is a string", function(done) {

      Code.expect(regex.slug).to.be.a.string();

      done();
    });

    lab.test("matches valid slug", function(done) {
      var re = new RegExp(regex.slug);

      Code.expect(re.test("aB3-")).to.be.true();

      done();
    });

    lab.test("does not match invalid slug", function(done) {
      var re = new RegExp(regex.slug);

      Code.expect(re.test("!@#$")).to.be.false();

      done();
    });
  });

  lab.experiment("script", function() {

    lab.test("is a string", function(done) {

      Code.expect(regex.script).to.be.a.string();

      done();
    });

    lab.test("matches script tag", function(done) {
      var re = new RegExp(regex.script);

      Code.expect(re.test("<script>console.log('hi')</script>")).to.be.true();

      done();
    });

    lab.test("does not match invalid script tag", function(done) {
      var re = new RegExp(regex.script);

      Code.expect(re.test("<script href='//elsewhe.re' />")).to.be.false();

      done();
    });
  });
});
