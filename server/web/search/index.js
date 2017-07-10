const Boom = require('boom');

exports.register = function (server, options, next) {
  const pagesService = server.plugins['services/pages'];

  server.route({
    method: 'GET',
    path: '/search{ext?}',
    handler: function (request, reply) {
      if (request.params.ext && request.params.ext !== '.atom') {
        return reply(Boom.notFound());
      }

      var defaultContext = {
        headTitle: 'Search',
        admin: false
      };

      var q = request.query.q;

      if (q && q.length > 0) {
        defaultContext.q = q;

        pagesService.find(q)
          .then(function (results) {
            var updated;
            if (results.length > 0) {
              defaultContext.pages = results;
              updated = results[0].updated;
            } else {
              defaultContext.genError = 'No results found for query: ' + q;
              updated = new Date();
            }

            if (request.params.ext === '.atom') {
              reply.view('search/atom', defaultContext, {
                layout: false
              })
                .header('Content-Type', 'application/atom+xml;charset=UTF-8')
                .header('Last-Modified', updated.toString());
            } else {
              reply.view('search/results', defaultContext);
            }
          })
          .catch(reply);
      } else {
        reply.view('search/form', defaultContext);
      }
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/search',
  dependencies: ['services/pages']
};
