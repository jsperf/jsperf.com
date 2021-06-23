require('dotenv').config();
const Joi = require('joi');

const prodOptional = {
  is: 'production',
  then: Joi.string().required(),
  otherwise: Joi.string().optional()
};

const envSchema = Joi.object().keys({
  SCHEME: Joi.string().valid('http', 'https').optional().default('http'),
  NODE_ENV: Joi.string().optional().default('development'),
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
  LOGGLY_TOKEN: Joi.string().when('NODE_ENV', prodOptional),
  LOGGLY_SUBDOMAIN: Joi.string().when('NODE_ENV', prodOptional),
  REDIS_HOST: Joi.string().when('NODE_ENV', prodOptional),
  REDIS_PORT: Joi.number().when('NODE_ENV', {
    is: 'production',
    then: Joi.number().required(),
    otherwise: Joi.number().optional()
  }),
  REDIS_PASSWORD: Joi.string().when('NODE_ENV', prodOptional)
}).unknown(true); // allow other keys in process.env not defined here

const result = Joi.validate(process.env, envSchema);

if (result.error) {
  throw new Error(`${result.error.details[0].path[0]} environment variable is missing`);
}

var Confidence = require('confidence');
var _assign = require('lodash.assign');

var criteria = {
  scheme: result.value.SCHEME
};

var config = {
  $meta: 'jsPerf.com',
  env: result.value.NODE_ENV,
  port: result.value.PORT,
  domain: result.value.DOMAIN,
  scheme: result.value.SCHEME,
  auth: {
    oauth: {
      secure: {
        $filter: 'scheme',
        'https': true,
        $default: false
      },
      github: {
        secret: result.value.GITHUB_CLIENT_SECRET,
        id: result.value.GITHUB_CLIENT_ID,
        callback: result.value.GITHUB_CALLBACK
      },
      cookiePass: result.value.BELL_COOKIE_PASS
    },
    session: {
      pass: result.value.COOKIE_PASS,
      name: 'sid-jsperf',
      secure: {
        $filter: 'scheme',
        'https': true,
        $default: false
      }
    }
  },
  browserscope: result.value.BROWSERSCOPE,
  mysql: {
    host: result.value.MYSQL_HOST,
    port: result.value.MYSQL_PORT,
    user: result.value.MYSQL_USER,
    pass: result.value.MYSQL_PASSWORD,
    db: result.value.MYSQL_DATABASE
  },
  loggly: {
    token: result.value.LOGGLY_TOKEN,
    subdomain: result.value.LOGGLY_SUBDOMAIN
  },
  cache: {
    host: result.value.REDIS_HOST,
    port: result.value.REDIS_PORT,
    password: result.value.REDIS_PASSWORD
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
