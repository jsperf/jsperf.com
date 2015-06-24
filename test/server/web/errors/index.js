"use strict";

var path = require("path");
var Lab = require("lab");
var Code = require("code");
var Hapi = require("hapi");
var Boom = require("boom");
var Config = require("../../../../config");
var Route400Plugin = {}, Route403Plugin = {}, Route405Plugin = {}, RouteBypassBoomPlugin = {};
var ErrorHandlerPlugin = require("../../../../server/web/errors");

Route400Plugin.register = function(localserv, options, next) {
  localserv.route({
      method: "GET",
      path: "/web/400",
      config: {
        handler: function loginHandler(req, rep) {
          rep(Boom.badRequest("invalid query"));
      }
    }
  });
  return next();
};

Route400Plugin.register.attributes = {
  name: "web/400"
};

Route403Plugin.register = function(localserv, options, next) {
  localserv.route({
      method: "GET",
      path: "/web/403",
      config: {
        handler: function loginHandler(req, rep) {
          rep(Boom.forbidden("not authorized"));
      }
    }
  });
  return next();
};

Route403Plugin.register.attributes = {
  name: "web/403"
};

Route405Plugin.register = function(localserv, options, next) {
  localserv.route({
      method: "GET",
      path: "/web/405",
      config: {
        handler: function loginHandler(req, rep) {
          rep(Boom.methodNotAllowed("not authorized"));
      }
    }
  });
  return next();
};

Route405Plugin.register.attributes = {
  name: "web/405"
};

RouteBypassBoomPlugin.register = function(localserv, options, next) {
  localserv.route({
      method: "GET",
      path: "/web/bypass",
      config: {
        handler: function loginHandler(req, rep) {
          rep("bypassed any boom errors");
      }
    }
  });
  return next();
};

RouteBypassBoomPlugin.register.attributes = {
  name: "web/bypass"
};



var lab = exports.lab = Lab.script();
var server;

lab.beforeEach(function(done) {
  var plugins = [ ErrorHandlerPlugin, Route400Plugin, Route403Plugin, Route405Plugin, RouteBypassBoomPlugin];
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

lab.experiment("errors", function() {
  lab.test("display a custom 403 page", function(done) {
    server.inject("/web/403", function(response) {
      Code.expect(response.statusCode).to.equal(403);
      Code.expect(response.result).to.include("You don’t have permission to view this document");
        
      done();
    });
  });

  lab.test("display a custom 400 page", function(done) {
    server.inject("/web/400", function(response) {
      Code.expect(response.statusCode).to.equal(400);
      Code.expect(response.result).to.include("The request cannot be fulfilled due to bad syntax");
        
      done();
    });
  });

  lab.test("display a custom 404 page", function(done) {
    server.inject("/silly/no/way/this/is/a/route", function(response) {
      Code.expect(response.statusCode).to.equal(404);
      Code.expect(response.result).to.include("The requested document could not be found");
        
      done();
    });
  });

  lab.test("display a general error page", function(done) {
    server.inject("/web/405", function(response) {
      Code.expect(response.result).to.include("something went wrong");
        
      done();
    });
  });

  lab.test("bypass custom error pages for all allowed routes", function(done) {
    server.inject("/web/bypass", function(response) {
      Code.expect(response.result).to.include("bypassed any boom errors");
        
      done();
    });
  });
});
