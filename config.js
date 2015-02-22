/**
  TODO create a setup script to customize this
*/

"use strict";

var Confidence = require("confidence");

var criteria = {
  env: process.env.NODE_ENV
};

var config = {
  projectName: "jsPerf.com",
  port: {
    web: {
      $filter: "env",
      test: 3003,
      $default: 3000
    }
  },
  admin: {
    email: "{{ADMIN_EMAIL}}"
  },
  browserscope: {
    apiKey: "{{BROWSERSCOPE_API_KEY}}"
  },
  db: {
    host: "{{DB_HOST}}",
    user: "{{DB_USER}}",
    pass: "{{DB_PASS}}",
    name: "{{DB_NAME}}"
  }
};

var store = new Confidence.Store(config);

exports.get = function(key) {
  return store.get(key, criteria);
};

exports.meta = function(key) {
  return store.meta(key, criteria);
};
