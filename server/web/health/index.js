const db = require('../../lib/db');

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/health',
    handler: function (request, reply) {
      db.genericQuery('SELECT 1;')
        .then(function () {
          reply();
        })
        .catch(reply);
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/health'
};
