"use strict";

var path = require("path");
var querystring = require("querystring");

var Lab = require("lab");
var Code = require("code");
var Hapi = require("hapi");
var proxyquire = require("proxyquire");

var Config = require("../../../../config");

var pagesServiceStub = {
  checkIfSlugAvailable: function() {},
  create: function() {}
};

var HomePlugin = proxyquire("../../../../server/web/home/index", {
  "../../services/pages": pagesServiceStub
});

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function(done) {
  var plugins = [ HomePlugin ];
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

lab.experiment("home", function() {

  lab.experiment("GET", function() {

    lab.beforeEach(function(done) {
      request = {
        method: "GET",
        url: "/"
      };

      done();
    });

    lab.test("it responds with the home page", function(done) {
      server.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);

        done();
      });
    });
  });

  lab.experiment("POST", function() {

    var formalizePayload = function(payload) {

      for (var i = 0, ptl = payload.test.length; i < ptl; i++) {
        // stringify object so Joi sees them as such
        payload.test[i] = JSON.stringify(payload.test[i]);
      }

      // transform payload into string like a form would
      return querystring.stringify(payload);
    };

    lab.beforeEach(function(done) {
      request = {
        method: "POST",
        url: "/",
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        payload: {
          author: "Pitcher Man",
          authorEmail: "kool-aid@kraft.com",
          authorURL: "http://kool-aid.com",
          title: "oh",
          slug: "oh-yea",
          info: "",
          initHTML: "",
          setup: "",
          teardown: "",
          question: "no",
          test: [
            {
              title: "t1",
              code: "t=1"
            },
            {
              title: "t2",
              code: "t=2"
            }
          ]
        }
      };

      done();
    });

    lab.experiment("validation", function() {

      lab.test("title required", function(done) {
        delete request.payload.title;
        request.payload = formalizePayload(request.payload);

        server.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include("You must enter a title for this test case.");

          done();
        });
      });

      lab.test("question required", function(done) {
        delete request.payload.question;
        request.payload = formalizePayload(request.payload);

        server.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include("spammer");

          done();
        });
      });

      lab.test("slug required", function(done) {
        delete request.payload.slug;
        request.payload = formalizePayload(request.payload);

        server.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include("The slug can only contain alphanumeric characters and hyphens.");

          done();
        });
      });

      lab.test("test title required", function(done) {
        delete request.payload.test[0].title;
        request.payload = formalizePayload(request.payload);

        server.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include("Please enter a title for this code snippet.");

          done();
        });
      });

      lab.test("test code required", function(done) {
        delete request.payload.test[0].code;
        request.payload = formalizePayload(request.payload);

        server.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include("Please enter a code snippet.");

          done();
        });
      });

      lab.test("generic error", function(done) {
        request.payload.test[0].defer = "unexpected";
        request.payload = formalizePayload(request.payload);

        server.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include("Please review required fields and save again.");

          done();
        });
      });
    });

    lab.experiment("slug check", function() {

      lab.beforeEach(function(done) {
        request.payload = formalizePayload(request.payload);

        done();
      });

      lab.afterEach(function(done) {
        pagesServiceStub.checkIfSlugAvailable = function() {};

        done();
      });

      lab.test("handles error", function(done) {
        var errMsg = "testing-very-unique-msg";
        pagesServiceStub.checkIfSlugAvailable = function(a, b, cb) {
          cb(new Error(errMsg));
        };

        server.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include(errMsg);

          done();
        });
      });

      lab.test("not available", function(done) {
        pagesServiceStub.checkIfSlugAvailable = function(a, b, cb) {
          cb(null, false);
        };

        server.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include("This slug is already in use. Please choose another one.");

          done();
        });
      });
    });

    lab.experiment("create page", function() {

      lab.beforeEach(function(done) {
        request.payload = formalizePayload(request.payload);

        pagesServiceStub.checkIfSlugAvailable = function(a, b, cb) {
          cb(null, true);
        };

        done();
      });

      lab.afterEach(function(done) {
        pagesServiceStub.checkIfSlugAvailable = function() {};
        pagesServiceStub.create = function() {};

        done();
      });

      lab.test("handles error", function(done) {
        var errMsg = "testing-very-very-unique-msg";
        pagesServiceStub.create = function(a, cb) {
          cb(new Error(errMsg));
        };

        server.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);

          Code.expect(response.result).to.include(errMsg);

          done();
        });
      });

      lab.test("redirects to slug", function(done) {
        pagesServiceStub.create = function(a, cb) {
          cb(null);
        };

        server.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(302);
          Code.expect(response.headers.location).to.include(querystring.parse(request.payload).slug);

          done();
        });
      });
    });
  });
});
