var pagesRepo = require('../../repositories/pages');

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/sitemap.xml',
    handler: function (request, reply) {
      pagesRepo.getSitemap()
      .then(function (items) {
        reply
          .view('sitemap/xml', {
            items: items
          }, {
            layout: false
          })
          .header('Content-Type', 'application/xml;charset=UTF-8');
      })
      .catch(reply);
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/sitemap'
};
