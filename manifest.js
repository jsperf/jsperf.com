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
  plugins: [
    {'blipp': {}},
    {'good': {
      reporters: [{
        reporter: 'good-console',
        args: [{
          log: '*',
          response: '*'
        }]
      }]
    }},
    {'visionary': {
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
    }},
    {'yar': {
      cookieOptions: {
        // name: 'jsPerf', FIXME
        password: config.get('/browserscope'),
        isSecure: !config.get('/debug'),
        isHttpOnly: true
      }
    }},
    {'bell': {}},
    {'hapi-auth-cookie': {}},
    {'./server/web/auth/strategies': {
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
    }},
    {'./server/api/json': {}},
    {'./server/api/jsonp': {}},
    {'./server/web/auth/github': {}},
    {'./server/web/browse': {}},
    {'./server/web/contributors': {}},
    {'./server/web/errors': {}},
    {'./server/web/faq': {}},
    {'./server/web/health': {}},
    {'./server/web/home': {}},
    {'./server/web/popular': {}},
    {'./server/web/public': {}},
    {'./server/web/redirects': {}},
    {'./server/web/search': {}},
    {'./server/web/sitemap/xml': {}},
    {'./server/web/test': {}},
    {'./server/web/edit': {}}
  ]
};

var store = new Confidence.Store(manifest);

exports.get = function (key) {
  return store.get(key, criteria);
};

exports.meta = function (key) {
  return store.meta(key, criteria);
};
