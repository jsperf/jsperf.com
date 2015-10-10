var config = require('../../../config')

exports.register = function (server, options, next) {
  server.auth.strategy('session', 'cookie', {
    password: config.get('/auth/session/pass'),
    cookie: config.get('/auth/session/name'),
    redirectTo: false,
    isSecure: config.get('/auth/session/secure')
  })

  server.auth.strategy('github', 'bell', {
    provider: 'github',
    password: config.get('/auth/oauth/cookiePass'),
    clientId: config.get('/auth/oauth/github/id'),
    clientSecret: config.get('/auth/oauth/github/secret'),
    isSecure: config.get('/auth/oauth/secure'),
    location: config.get('/scheme') + '://' + config.get('/domain')
  })

  return next()
}

exports.register.attributes = {
  name: 'web/auth/strategies'
}
