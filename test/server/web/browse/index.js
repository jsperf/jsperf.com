"use strict";

var path = require("path");

var Lab = require("lab");
var Code = require("code");
var Hapi = require("hapi");
var proxyquire = require("proxyquire");

var Config = require("../../../../config");

var pagesRepoStub = {};

var BrowsePlugin = proxyquire("../../../../server/web/browse/index", {
  "../../repositories/pages": pagesRepoStub
});

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function(done) {
  var plugins = [ BrowsePlugin ];
  server = new Hapi.Server();
  server.connection({
    port: Config.get("/port/web")
  });
  server.views({
    engines: {
      hbs: require("handlebars")
    },
    path: "./server/web",
    layout: true,
    helpersPath: "templates/helpers",
    partialsPath: "templates/partials",
    relativeTo: path.join(__dirname, "..", "..", "..", "..")
  });
  server.register(plugins, done);
});

lab.experiment("browse", function() {
  lab.beforeEach(function(done) {
    request = {
      method: "GET",
      url: "/browse"
    };

    done();
  });

  lab.test("it responds with the browse page", function(done) {
    pagesRepoStub.getLatestVisible250 = function(cb) {
      cb(null, []);
    };

    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });

  lab.test("it responds with generic error", function(done) {
    pagesRepoStub.getLatestVisible250 = function(cb) {
      cb(new Error());
    };

    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });
});
