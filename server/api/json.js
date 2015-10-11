exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/api/json',
    handler: function (request, reply) {
      reply({ content: 'test' });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'api/json'
};
