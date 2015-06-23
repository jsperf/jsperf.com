"use strict";

var path = require("path");

var Lab = require("lab");
var Code = require("code");
var Hapi = require("hapi");
var proxyquire = require("proxyquire");

var Config = require("../../../../config");

var pagesServiceStub = {
  checkIfSlugAvailable: function() {},
  create: function() {}
};

var GitHubPlugin = proxyquire("../../../../server/web/auth/github", {
  "../../services/pages": pagesServiceStub
});

var AuthPlugin = {
  register: require("bell"),
  options: {}
};

var AuthCookiePlugin = {
  register: require("hapi-auth-cookie"),
  options: {}
};

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function(done) {
  var plugins = [ GitHubPlugin ];
  server = new Hapi.Server();

  server.connection({
    port: Config.get("/port/web")
  });

  server.register([ AuthCookiePlugin, AuthPlugin ], function(){

    server.auth.strategy("session", "cookie", {
      password: Config.get("/auth/session/pass"),
      cookie: Config.get("/auth/session/name"),
      redirectTo: false,
      isSecure: Config.get("/auth/session/secure")
    });

    server.auth.strategy("github", "bell", {
      provider: "github",
      password: Config.get("/auth/oauth/cookiePass"),
      clientId: Config.get("/auth/oauth/github/id"),
      clientSecret: Config.get("/auth/oauth/github/secret"),
      isSecure: Config.get("/auth/oauth/secure"),
      location: Config.get("/scheme") + "://" + Config.get("/domain")
    });
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

lab.experiment("auth/GitHub", function() {

  lab.experiment("GET", function() {

    lab.beforeEach(function(done) {
      request = {
        method: "GET",
        url: "/auth/github"
      };

      done();
    });

    lab.test("redirect to GitHub to auth", function(done) {
      server.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(302);
        Code.expect(response.headers.location).to.include("github.com/login/oauth");

        done();
      });
    });

    lab.test("do not start session if not auth'd", function(done) {
      server.inject(request, function(response) {
        Code.expect(response.headers["set-cookie"][0]).to.not.include("sid-jsperf");

        done();
      });
    });

    lab.test("sets a user's public GH profile to a session cookie if auth'd", function(done) {
      request.credentials = {profile: {"name": "test"}};

      server.inject(request, function(response) {
        Code.expect(response.headers["set-cookie"][0]).to.include("sid-jsperf");

        done();
      });
    });

  });

});
