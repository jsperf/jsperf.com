"use strict";

var Lab = require("lab");
var Code = require("code");
var Hapi = require("hapi");

var Config = require("../../../config");

var PublicPlugin = require("../../../server/web/public");

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function(done) {
  var plugins = [ PublicPlugin ];
  server = new Hapi.Server();
  server.connection({
    port: Config.get("/port/web")
  });
  server.register(plugins, done);
});

lab.experiment("Public", function() {
  lab.beforeEach(function(done) {
    request = {
      method: "GET"
    };

    done();
  });

  lab.test("it serves apple-touch-icon-precomposed.png", function(done) {
    request.url = "/apple-touch-icon-precomposed.png";
    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });

  lab.test("it serves apple-touch-icon.png", function(done) {
    request.url = "/public/apple-touch-icon.png";
    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });

  lab.test("it serves favicon.ico", function(done) {
    request.url = "/public/favicon.ico";
    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });

  lab.test("it serves robots.txt", function(done) {
    request.url = "/robots.txt";
    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });

  lab.experiment("_css", function() {
    lab.test("it serves main.css", function(done) {
      request.url = "/public/_css/main.css";
      server.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);

        done();
      });
    });
  });

  lab.experiment("_js", function() {
    lab.test("it serves main.js", function(done) {
      request.url = "/public/_js/main.js";
      server.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);

        done();
      });
    });
  });

});
