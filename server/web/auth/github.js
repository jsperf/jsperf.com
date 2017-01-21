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

  // attach authorSlug to view context to construct "My Tests" link in footer
  // in the future may use GitHub profile
  server.ext('onPreResponse', function (request, reply) {
    const response = request.response;
    if (response.variety && response.variety === 'view') {
      response.source.context = response.source.context || {};
      response.source.context.authorSlug = request.yar.get('authorSlug');
    }
    return reply.continue();
  });

  return next();
};

exports.register.attributes = {
  name: 'web/auth/github'
};
