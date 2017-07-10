var Boom = require('boom');

var getUpdatedDate = function (results) {
  var updated;

  if (results.length === 0) {
    updated = new Date();
  } else {
    updated = results[0].updated;
  }

  return updated;
};

exports.register = function (server, options, next) {
  const pagesRepo = server.plugins['repositories/pages'];

  server.route({
    method: 'GET',
    path: '/browse',
    handler: function (request, reply) {
      var context = {
        headTitle: 'Browse test cases',
        showAtom: {
          slug: 'browse'
        }
      };

      pagesRepo.getLatestVisible(250)
        .then(function (rows) {
          context.pages = rows;
          reply.view('browse/index', context);
        })
        .catch(function () {
          context.genError = 'Sorry. Could not find tests to browse.';
          reply.view('browse/index', context);
        });
    }
  });

  server.route({
    method: 'GET',
    path: '/browse.atom',
    handler: function (request, reply) {
      pagesRepo.getLatestVisible(20)
        .then(function (rows) {
          var updated = getUpdatedDate(rows);

          reply
            .view('browse/index-atom', {
              updated: updated.toISOString(),
              pages: rows
            }, {
              layout: false
            })
            .header('Content-Type', 'application/atom+xml;charset=UTF-8')
            .header('Last-Modified', updated.toString());
        })
        .catch(function (err) {
          reply(err);
        });
    }
  });

  server.route({
    method: 'GET',
    path: '/browse/{authorSlug}',
    handler: function (request, reply) {
      pagesRepo.getLatestVisibleForAuthor(request.params.authorSlug)
        .then(function (rows) {
          if (rows.length === 0) {
            reply(Boom.notFound('The author was not found'));
          } else {
            reply.view('browse/author', {
              headTitle: 'Test cases by ' + request.params.authorSlug,
              showAtom: {
                slug: 'browse/' + request.params.authorSlug
              },
              author: request.params.authorSlug,
              pages: rows
            });
          }
        })
        .catch(function (err) {
          reply(err);
        });
    }
  });

  server.route({
    method: 'GET',
    path: '/browse/{authorSlug}.atom',
    handler: function (request, reply) {
      pagesRepo.getLatestVisibleForAuthor(request.params.authorSlug)
        .then(function (rows) {
          var updated = getUpdatedDate(rows);

          reply.view('browse/author-atom', {
            author: request.params.authorSlug,
            update: updated.toISOString,
            pages: rows
          }, {
            layout: false
          })
            .header('Content-Type', 'application/atom+xml;charset=UTF-8')
            .header('Last-Modified', updated.toString());
        })
        .catch(function (err) {
          reply(err);
        });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/browse',
  dependencies: ['repositories/pages']
};
