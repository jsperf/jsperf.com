"use strict";

require("dotenv").load();

var Confidence = require("confidence");

var criteria = {
  env: process.env.NODE_ENV
};

var config = {
  $meta: "jsPerf.com",
  scheme: process.env.SCHEME,
  domain: process.env.DOMAIN,
  port: {
    web: process.env.PORT
  },
  admin: {
    email: process.env.ADMIN_EMAIL
  },
  browserscope: process.env.BROWSERSCOPE,
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME
  },
  debug: {
    $filter: "env",
    development: true,
    $default: false
  }
};

var store = new Confidence.Store(config);

exports.get = function(key) {
  return store.get(key, criteria);
};

exports.meta = function(key) {
  return store.meta(key, criteria);
};
