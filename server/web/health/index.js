exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/health',
    handler: function (request, reply) {
      server.plugins.db.genericQuery('SELECT 1;')
        .then(function () {
          reply();
        })
        .catch(reply);
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/health',
  dependencies: ['db']
};
