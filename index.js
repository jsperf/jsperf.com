"use strict";

require("dotenv").load();

var path = require("path");
var publicPath = path.join(__dirname, "public");
var Hapi = require("hapi");

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

server.route({
  method: "GET",
  path: "/",
  handler: function (request, reply) {
    reply("Hello, world!");
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
  path: "/public/{path*}",
  handler: {
    directory: {
      path: publicPath,
      index: false,
      redirectToSlash: false
    }
  }
});

module.exports = server;
