"use strict";

var Confidence = require("confidence");
var config = require("./config");

var criteria = {
  env: process.env.NODE_ENV
};

var manifest = {
  $meta: "jsPerf backend",
  server: {
    connections: {
      routes: {
        security: true
      }
    }
  },
  connections: [{
    port: config.get("/port/web"),
    labels: ["web"]
  }],
  plugins: {
    "good": {
      reporters: [{
        reporter: "good-console",
        args: [{
          log: "*",
          response: "*"
        }]
      }]
    },
    "visionary": {
      engines: {
        hbs: "handlebars"
      },
      relativeTo: __dirname,
      path: "./server/web",
      layout: true,
      helpersPath: "templates/helpers",
      partialsPath: "templates/partials",
      context: {
        $filter: "env",
        development: {
          debug: true,
          cssFile: "main.src.css?" + Date.now(),
          title: "jsPerf-dev"
        },
        $default: {
          cssFile: "main.css",
          title: "jsPerf: JavaScript performance playground"
        }
      }
    },
    "./server/api/json": {},
    "./server/api/jsonp": {},
    "./server/web/home": {},
    "./server/web/public": {},
    "./server/web/redirects": {}
  }
};

var store = new Confidence.Store(manifest);

exports.get = function(key) {
  return store.get(key, criteria);
};

exports.meta = function(key) {
  return store.meta(key, criteria);
};
