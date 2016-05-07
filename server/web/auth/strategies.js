exports.register = function (server, options, next) {
  server.log(['debug'], 'registering auth strategies');

  server.auth.strategy('session', 'cookie', {
    password: options.session.password,
    cookie: options.session.cookie,
    redirectTo: false,
    isSecure: options.session.isSecure
  });

  server.auth.strategy('github', 'bell', {
    provider: 'github',
    password: options.oauth.password,
    clientId: options.oauth.clientId,
    clientSecret: options.oauth.clientSecret,
    isSecure: options.oauth.isSecure,
    location: options.oauth.location
  });

  return next();
};

exports.register.attributes = {
  name: 'web/auth/strategies'
};
