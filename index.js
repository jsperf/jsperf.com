"use strict";

require("dotenv").load();
var Hapi = require("hapi");

var server = new Hapi.Server();
server.connection({ port: process.env.PORT });

server.route({
  method: "GET",
  path: "/",
  handler: function (request, reply) {
    reply("Hello, world!");
  }
});

module.exports = server;
