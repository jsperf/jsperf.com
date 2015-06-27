"use strict";

var path = require("path");

var Lab = require("lab");
var Code = require("code");
var Hapi = require("hapi");
var proxyquire = require("proxyquire");

/*global Promise:true*/
var Promise = require('bluebird');

var Config = require("../../../../config");

var pagesServiceStub = {};

var PopularPlugin = proxyquire("../../../../server/web/search/index", {
  "../../services/pages": pagesServiceStub
});

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function(done) {
  var plugins = [ PopularPlugin ];
  server = new Hapi.Server();
  server.connection({
    port: Config.get("/port/web")
  });
  server.views({
    engines: {
      hbs: require("handlebars")
    },
    path: "./server/web",
    relativeTo: path.join(__dirname, "..", "..", "..", "..")
  });
  server.register(plugins, done);
});

lab.experiment("search", function() {
  lab.beforeEach(function(done) {
    request = {
      method: "GET",
      url: "/search"
    };

    done();
  });

  lab.test("it responds with search form", function(done) {
    pagesServiceStub.getSearch = function() {
      return Promise.resolve([]);
    };

    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include([
        "Search jsPerf",
        "<form"
      ]);

      done();
    });
  });

  lab.test("it responds with search results", function(done) {
    var currentTime = new Date();
    pagesServiceStub.getSearch = function() {
      return Promise.resolve([{
        url: "http://example.com",
        revision: 1,
        title: "Test result",
        revisionCount: 1,
        updated: currentTime
      }]);
    };

    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include([
        "http://example.com",
        "Test result",
        currentTime.toISOString()
      ]);
      done();
    });
  });

  lab.test("it responds with error", function(done) {
    pagesServiceStub.getSearch = function() {
      return Promise.reject(new Error("Test error"));
    };

    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });
});
