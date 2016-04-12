require('dotenv').load();

var Confidence = require('confidence');
var _ = require('lodash');
var configLib = require('./lib/config');

configLib.normalizeDomain();

var criteria = {
  env: process.env.NODE_ENV,
  scheme: process.env.SCHEME
};

var config = {
  $meta: 'jsPerf.com',
  scheme: process.env.SCHEME,
  domain: process.env.DOMAIN,
  auth: {
    oauth: {
      secure: {
        $filter: 'scheme',
        'https': true,
        $default: false
      },
      github: {
        secret: process.env.GITHUB_CLIENT_SECRET,
        id: process.env.GITHUB_CLIENT_ID
      },
      cookiePass: process.env.BELL_COOKIE_PASS
    },
    session: {
      pass: process.env.COOKIE_PASS,
      name: 'sid-jsperf',
      secure: {
        $filter: 'scheme',
        'https': true,
        $default: false
      }
    }
  },
  port: {
    web: process.env.PORT
  },
  admin: {
    email: process.env.ADMIN_EMAIL
  },
  browserscope: process.env.BROWSERSCOPE,
  debug: {
    $filter: 'env',
    development: true,
    $default: false
  }
};

var store = new Confidence.Store(config);

exports.get = function (key, overrides) {
  _.assign(criteria, overrides);
  return store.get(key, criteria);
};

exports.meta = function (key) {
  return store.meta(key, criteria);
};
