"use strict";

require("dotenv").load();

var Confidence = require("confidence");

var criteria = {
  env: process.env.NODE_ENV
};

var config = {
  projectName: "jsPerf.com",
  port: {
    web: process.env.PORT
  },
  admin: {
    email: process.env.ADMIN_EMAIL
  },
  browserscope: {
    apiKey: process.env.BROWSERSCOPE_API_KEY
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME
  }
};

var store = new Confidence.Store(config);

exports.get = function(key) {
  return store.get(key, criteria);
};

exports.meta = function(key) {
  return store.meta(key, criteria);
};
