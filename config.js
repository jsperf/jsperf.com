require('dotenv').config();
const Joi = require('joi');

const envSchema = Joi.object().keys({
  SCHEME: Joi.string().valid('http', 'https').optional().default('http'),
  NODE_ENV: Joi.string().required(),
  PORT: Joi.number().optional().default(3000),
  DOMAIN: Joi.string().optional().default('localhost'),
  GITHUB_CLIENT_SECRET: Joi.string().required(),
  GITHUB_CLIENT_ID: Joi.string().required(),
  GITHUB_CALLBACK: Joi.string().required(),
  BELL_COOKIE_PASS: Joi.string().required(),
  COOKIE_PASS: Joi.string().required(),
  BROWSERSCOPE: Joi.string().required(),
  MYSQL_HOST: Joi.string().optional().default('localhost'),
  MYSQL_PORT: Joi.number().optional().default(3306),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_DATABASE: Joi.string().required(),
  LOGGLY_TOKEN: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  LOGGLY_SUBDOMAIN: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  })
}).unknown(true); // allow other keys in process.env not defined here

const result = Joi.validate(process.env, envSchema);

if (result.error) {
  throw new Error(`${result.error.details[0].path} environment variable is missing`);
}

var Confidence = require('confidence');
var _assign = require('lodash.assign');

var criteria = {
  scheme: process.env.SCHEME
};

var config = {
  $meta: 'jsPerf.com',
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  domain: process.env.DOMAIN,
  scheme: process.env.SCHEME,
  auth: {
    oauth: {
      secure: {
        $filter: 'scheme',
        'https': true,
        $default: false
      },
      github: {
        secret: process.env.GITHUB_CLIENT_SECRET,
        id: process.env.GITHUB_CLIENT_ID,
        callback: process.env.GITHUB_CALLBACK
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
  browserscope: process.env.BROWSERSCOPE,
  mysql: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    pass: process.env.MYSQL_PASSWORD,
    db: process.env.MYSQL_DATABASE
  },
  loggly: {
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN
  }
};

var store = new Confidence.Store(config);

exports.get = function (key, overrides) {
  _assign(criteria, overrides);
  return store.get(key, criteria);
};

exports.meta = function (key) {
  return store.meta(key, criteria);
};
