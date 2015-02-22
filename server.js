"use strict";

var composer = require("./index");

composer(function(err, server) {
  if (err) {
    throw err;
  }

  server.start(function() {
    server.log("info", "Server running at: " + server.info.uri);
  });
});
