"use strict";

var path = require("path");

var Lab = require("lab");
var Code = require("code");
var Hapi = require("hapi");
var proxyquire = require("proxyquire");

var Config = require("../../../../config");

var pagesServiceStub = {
  updateHits: function() {},
  getBySlug: function() {}
};

var TestPlugin = proxyquire("../../../../server/web/test/index", {
  "../../services/pages": pagesServiceStub
});

var YarPlugin = {
  register: require("yar"),
  options: { cookieOptions: { password: "testing" } }
};

var AuthPlugin = {
  register: require("hapi-auth-cookie"),
  options: {}
};

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function(done) {
  var plugins = [ TestPlugin, YarPlugin ];
  server = new Hapi.Server();

  server.connection({
    port: Config.get("/port/web")
  });

  server.register([ AuthPlugin ], function() {
    server.auth.strategy("session", "cookie", {
      password: "testing",
      cookie: "sid-jsperf",
      redirectTo: false,
      isSecure: false
    });
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

lab.experiment("test", function() {
  let slug = "oh-yea";

  lab.beforeEach(function(done) {
    request = {
      method: "GET",
      url: "/" + slug
    };

    done();
  });

  lab.test("not found", function(done) {
    pagesServiceStub.getBySlug = function(s, r, cb) {
      cb(new Error("Not found"));
    };

    // adding revision to url here covers true case of rev ternary
    request.url += "/999";

    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(404);

      done();
    });
  });

  lab.test("fail to get by slug", function(done) {
    pagesServiceStub.getBySlug = function(s, r, cb) {
      cb(new Error("real helpful"));
    };

    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });

  lab.test("it responds with test page for slug", function(done) {
    let now = new Date();

    pagesServiceStub.getBySlug = function(s, r, cb) {
      cb(null, {
        id: 1,
        slug: slug,
        revision: 1,
        browserscopeID: "abc123",
        title: "Oh Yea",
        info: "Sample test",
        setup: "",
        teardown: "",
        initHTML: "",
        visible: "y",
        author: "Max",
        authorEmail: "m@b.co",
        authorURL: "b.co",
        hits: 0,
        published: now,
        updated: now
      }, [], [], []);
    };

    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });

  lab.test("it responds with highlighted test page for slug", function(done) {
    let now = new Date();

    pagesServiceStub.getBySlug = function(s, r, cb) {
      cb(null, {
        id: 1,
        slug: slug,
        revision: 1,
        browserscopeID: "abc123",
        title: "Oh Yea",
        info: "Sample test",
        setup: "var a = 1",
        teardown: "delete a",
        initHTML: "<div class=\"test\"><script>var b = 2;</script></div>",
        visible: "n",
        author: "Max",
        authorEmail: "m@b.co",
        authorURL: "b.co",
        hits: 0,
        published: now,
        updated: now
      }, [], [], []);
    };

    server.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);

      done();
    });
  });
});
