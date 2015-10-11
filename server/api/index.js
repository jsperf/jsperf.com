exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/api',
    handler: function (request, reply) {
      // TODO: track google analytics
      reply('API');
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'api/index'
};
