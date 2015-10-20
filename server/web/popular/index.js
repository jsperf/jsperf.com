var pagesService = require('../../services/pages');

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/popular',
    handler: function (request, reply) {
      pagesService.getPopular()
      .then(function (popular) {
        reply.view('popular/index', {
          headTitle: 'Popular test cases',
          ga: true,
          admin: false,
          recent: popular.recent,
          allTime: popular.allTime
        });
      })
      .catch(reply);
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/popular'
};
