'use strict';

var Boom = require('boom');
var debug = require('debug')('jsperf:web:test');
var hljs = require('highlight.js');
var pagesService = require('../../services/pages');
var regex = require('../../lib/regex');

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/{testSlug}/{rev}/edit',
    handler: function (request, reply) {
      const rev = request.params.rev ? request.params.rev : 1;
      pagesService.getBySlug(request.params.testSlug, rev)
      .then(function (values) {
        let page = values[0];
        page.test = values[1];
        page.revision = values[2];
        const own = request.session.get('own') || {};
        const isOwn = own[page.id];
        const isAdmin = request.session.get('admin');

        reply.view('edit/index', {
          benchmark: true,
          showAtom: {
            slug: request.path.slice(1) // remove slash
          },
          jsClass: true,
          isOwn: isOwn,
          isAdmin: isAdmin,
          page: page
        });
      })
      .catch(function (err) {
        if (err.message === 'Not found') {
          reply(Boom.notFound('The page was not found'));
        } else {
          reply(err);
        }
      });
    }
  });
  // TODO: atom feed

  return next();
};

exports.register.attributes = {
  name: 'web/edit'
};
