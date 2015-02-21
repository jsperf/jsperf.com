"use strict";

require("dotenv").load();

var path = require("path");
var Hapi = require("hapi");

var pkg = require("./package.json");

var publicPath = path.join(__dirname, "public");

var server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: publicPath
      }
    }
  }
});

server.connection({ port: process.env.PORT });

server.views({
  engines: {
    html: require("handlebars")
  },
  relativeTo: __dirname,
  path: "templates",
  layout: "layout",
  helpersPath: "templates/helpers",
  partialsPath: "templates/partials",
  context: function() {
    var debug = process.env.NODE_ENV === "development";
    var domain = server.info.host;
    var cssFile = "main.css";

    if (debug) {
      cssFile = "main.src.css?" + Date.now();
      domain += ":" + server.info.port;
    }

    return {
      debug: debug,
      version: pkg.version,
      title: "jsPerf: JavaScript performance playground",
      domain: domain,
      assetsDomain: process.env.ASSETS_DOMAIN,
      cssFile: cssFile
    };
  }
});

server.route({
  method: "GET",
  path: "/",
  handler: function (request, reply) {
    reply.view("index");
  }
});

["apple-touch-icon-precomposed.png", "apple-touch-icon.png", "favicon.ico", "robots.txt"].forEach(function(ico) {
  server.log("registering ", ico);
  server.route({
    method: "GET",
    path: "/" + ico,
    handler: {
      file: ico
    }
  });
});

server.route({
  method: "GET",
  path: "/{path*}",
  handler: {
    directory: {
      path: publicPath,
      index: false,
      redirectToSlash: false
    }
  }
});

module.exports = server;
