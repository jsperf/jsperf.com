exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/auth/github',
    config: {
      auth: 'github',
      handler: function (request, reply) {
        request.cookieAuth.clear();
        request.cookieAuth.set(request.auth.credentials.profile);
        return reply.redirect('/');
      }
    }
  });

  // attach credentials to view context to let people know they are logged in
  // attach authorGitHub to view context to construct "My Tests" link in footer
  server.ext('onPreResponse', function (request, reply) {
    const response = request.response;
    if (response.variety === 'view') {
      response.source.context = response.source.context || {};
      response.source.context.credentials = request.auth.isAuthenticated ? request.auth.credentials : null;
      response.source.context.authorGitHub = request.yar.get('authorGitHub');
    }
    return reply.continue();
  });

  return next();
};

exports.register.attributes = {
  name: 'web/auth/github'
};
