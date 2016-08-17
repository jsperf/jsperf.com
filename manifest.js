var Confidence = require('confidence');
var _ = require('lodash');
var config = require('./config');

var criteria = {
  env: process.env.NODE_ENV
};

var visionaryContextDefault = {
  cssFile: 'main.css',
  scheme: config.get('/scheme'),
  domain: config.get('/domain')
};

var manifest = {
  $meta: 'jsPerf backend',
  server: {
    connections: {
      routes: {
        security: true
      }
    }
  },
  connections: [{
    port: config.get('/port/web'),
    labels: ['web']
  }],
  registrations: [
    { plugin: 'hapi-qs' },
    { plugin: 'blipp' },
    { plugin: 'scooter' },
    {
      plugin: {
        register: 'good',
        options: {
          ops: {
            interval: 10000
          },
          reporters: {
            console: [
              { module: 'good-console' },
              'stdout'
            ]
          }
        }
      }
    },
    { plugin: 'inert' },
    { plugin: 'vision' },
    {
      plugin: {
        register: 'visionary',
        options: {
          engines: {
            hbs: 'handlebars'
          },
          relativeTo: __dirname,
          path: './server/web',
          layout: true,
          helpersPath: 'templates/helpers',
          partialsPath: 'templates/partials',
          context: {
            $filter: 'env',
            development: _.assign(visionaryContextDefault, {
              debug: true,
              cssFile: 'main.src.css?' + Date.now()
            }),
            $default: visionaryContextDefault
          }
        }
      }
    },
    {
      plugin: {
        register: 'yar',
        options: {
          cookieOptions: {
            // name: 'jsPerf', FIXME
            password: config.get('/auth/session/pass'),
            isSecure: !config.get('/debug'),
            isHttpOnly: true
          }
        }
      }
    },
    { plugin: 'bell' },
    { plugin: 'hapi-auth-cookie' },
    {
      plugin: {
        register: './server/web/auth/strategies',
        options: {
          session: {
            password: config.get('/auth/session/pass'),
            cookie: config.get('/auth/session/name'),
            isSecure: config.get('/auth/session/secure')
          },
          oauth: {
            password: config.get('/auth/oauth/cookiePass'),
            clientId: config.get('/auth/oauth/github/id'),
            clientSecret: config.get('/auth/oauth/github/secret'),
            isSecure: config.get('/auth/oauth/secure'),
            location: config.get('/scheme') + '://' + config.get('/domain')
          }
        }
      }
    },
    { plugin: './server/api/json' },
    { plugin: './server/api/jsonp' },
    { plugin: './server/web/auth/github' },
    { plugin: './server/web/browse' },
    { plugin: './server/web/comment' },
    { plugin: './server/web/contributors' },
    { plugin: './server/web/errors' },
    { plugin: './server/web/faq' },
    { plugin: './server/web/health' },
    { plugin: './server/web/home' },
    { plugin: './server/web/popular' },
    { plugin: './server/web/public' },
    { plugin: './server/web/redirects' },
    { plugin: './server/web/search' },
    { plugin: './server/web/sitemap/xml' },
    { plugin: './server/web/test' },
    { plugin: './server/web/edit' },
    { plugin: './server/web/delete' }
  ]
};

var store = new Confidence.Store(manifest);

exports.get = function (key) {
  return store.get(key, criteria);
};

exports.meta = function (key) {
  return store.meta(key, criteria);
};
