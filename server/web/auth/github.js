exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/auth/github',
    config: {
      auth: 'github',
      handler: function (request, reply) {
        request.auth.session.clear();
        request.auth.session.set(request.auth.credentials.profile);
        return reply.redirect('/');
      }
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/auth/github'
};
