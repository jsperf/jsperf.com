"use strict";

var Good = require("good");
var server = require("./index.js");

server.register({
  register: Good,
  options: {
    reporters: [{
      reporter: require("good-console"),
      args: [{
        log: "*",
        response: "*"
      }]
    }]
  }
}, function(err) {
  if (err) {
    throw err;
  }

  server.start(function() {
    server.log("info", "Server running at: " + server.info.uri);
  });
});
