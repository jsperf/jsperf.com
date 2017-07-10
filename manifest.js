var Confidence = require('confidence');
var _assign = require('lodash.assign');
var config = require('./config');

var criteria = {
  env: config.get('/env')
};

var visionaryContextDefault = {
  cssFile: 'main.css',
  hljsCssVer: require('highlight.js/package.json').version,
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
    port: config.get('/port'),
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
          reporters: {
            $filter: 'env',
            production: {
              loggly: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{log: '*', request: '*', error: '*', response: '*'}]
              }, {
                module: 'good-loggly',
                args: [{
                  token: config.get('/loggly/token'),
                  subdomain: config.get('/loggly/subdomain'),
                  // tags: ['global', 'tags', 'for', 'all', 'requests'],
                  name: 'jsperf',
                  hostname: config.get('/domain'),
                  threshold: 20,
                  maxDelay: 15000
                }]
              }]
            },
            $default: {
              console: [
                { module: 'good-console' },
                'stdout'
              ]
            }
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
            development: _assign(visionaryContextDefault, {
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
            password: config.get('/auth/session/pass'),
            isSecure: config.get('/auth/session/secure'),
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
            location: config.get('/auth/oauth/github/callback')
          }
        }
      }
    },
    {
      plugin: {
        register: './server/lib/db',
        options: {
          host: config.get('/mysql/host'),
          port: config.get('/mysql/port'),
          user: config.get('/mysql/user'),
          pass: config.get('/mysql/pass'),
          db: config.get('/mysql/db'),
          debug: criteria.env !== 'production'
        }
      }
    },
    {
      plugin: {
        register: './server/repositories/browserscope',
        options: {
          api_key: config.get('/browserscope'),
          scheme: config.get('/scheme'),
          domain: config.get('/domain')
        }
      }
    },
    {
      plugin: {
        register: './server/lib/cache',
        options: {
          host: config.get('/cache/host'),
          port: config.get('/cache/port'),
          password: config.get('/cache/password'),
          partition: 'jsperf'
        }
      }
    },
    { plugin: './server/repositories/comments' },
    { plugin: './server/repositories/pages' },
    { plugin: './server/repositories/tests' },
    { plugin: './server/services/comments' },
    { plugin: './server/services/pages' },
    { plugin: './server/api/json' },
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
    { plugin: './server/web/sponsor' },
    { plugin: './server/web/test' },
    { plugin: './server/web/testimonials' },
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
