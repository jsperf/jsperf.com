exports.register = function (server, options, next) {
  const pagesService = server.plugins['services/pages'];
  server.route({
    method: 'GET',
    path: '/popular',
    handler: function (request, reply) {
      pagesService.getPopular()
      .then(function (popular) {
        reply.view('popular/index', {
          headTitle: 'Popular test cases',
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
  name: 'web/popular',
  dependencies: ['services/pages']
};
