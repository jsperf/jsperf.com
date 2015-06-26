"use strict";

var Confidence = require("confidence");
var _ = require("lodash");
var config = require("./config");

var criteria = {
  env: process.env.NODE_ENV
};

var visionaryContextDefault = {
  cssFile: "main.css",
  headTitle: "jsPerf: JavaScript performance playground",
  scheme: config.get("/scheme"),
  domain: config.get("/domain")
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
  plugins: [
    {"blipp": {}},
    {"good": {
      reporters: [{
        reporter: "good-console",
        args: [{
          log: "*",
          response: "*"
        }]
      }]
    }},
    {"visionary": {
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
        development: _.assign(visionaryContextDefault, {
          debug: true,
          cssFile: "main.src.css?" + Date.now(),
          headTitle: "jsPerf-dev"
        }),
        $default: visionaryContextDefault
      }
    }},
    {"yar": {
      cookieOptions: {
        // name: "jsPerf", FIXME
        password: config.get("/browserscope"),
        isSecure: !config.get("/debug"),
        isHttpOnly: true
      }
    }},
    {"bell": {}},
    {"hapi-auth-cookie": {}},
    {"./server/web/auth/strategies": {}},
    {"./server/api/json": {}},
    {"./server/api/jsonp": {}},
    {"./server/web/browse": {}},
    {"./server/web/contributors": {}},
    {"./server/web/dart": {}},
    {"./server/web/faq": {}},
    {"./server/web/home": {}},
    {"./server/web/popular": {}},
    {"./server/web/search": {}},
    {"./server/web/public": {}},
    {"./server/web/redirects": {}},
    {"./server/web/sitemap/xml": {}},
    {"./server/web/auth/github": {}}
  ]
};

var store = new Confidence.Store(manifest);

exports.get = function(key) {
  return store.get(key, criteria);
};

exports.meta = function(key) {
  return store.meta(key, criteria);
};
