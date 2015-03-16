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
    "blipp": {},
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
          headTitle: "jsPerf-dev"
        },
        $default: {
          cssFile: "main.css",
          headTitle: "jsPerf: JavaScript performance playground",
          scheme: config.get("/scheme"),
          domain: config.get("/domain")
        }
      }
    },
    "yar": {
      cookieOptions: {
        password: config.get("/browserscope"),
        isSecure: !config.get("/debug")
      }
    },
    "./server/api/json": {},
    "./server/api/jsonp": {},
    "./server/web/browse": {},
    "./server/web/contributors": {},
    "./server/web/dart": {},
    "./server/web/faq": {},
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
