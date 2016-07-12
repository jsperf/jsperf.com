'use strict';
var Boom = require('boom');
var debug = require('debug')('jsperf:web:test');
var hljs = require('highlight.js');
var pagesService = require('../../services/pages');
var regex = require('../../lib/regex');

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/{testSlug}/{rev?}',
    handler: function (request, reply) {
      const rev = request.params.rev || 1;

      pagesService.getBySlug(request.params.testSlug, rev)
      .then(function (values) {
        var page = values[0];
        page.test = values[1];
        page.revision = values[2];
        page.comments = values[3];

        const hasSetupOrTeardown = page.setup.length || page.teardown.length;
        const hasPrep = page.initHTML.length || hasSetupOrTeardown;

        var stripped = false;

        if (hasPrep) {
          const reScripts = new RegExp(regex.script, 'i');
          stripped = page.initHTML.replace(reScripts, '');

          var swappedScripts = [];

          // highlight the JS inside HTML while highlighting the HTML
          page.initHTMLHighlighted = hljs.highlight('html',
            page.initHTML.replace(reScripts, function (match, open, contents, close) {
              // highlight JS inside script tags
              var highlightedContents = hljs.highlight('js', contents).value;
              // store to put back in place later
              swappedScripts.unshift(highlightedContents.replace(/&nbsp;$/, ''));
              // insert marker to replace shortly
              return open + '@jsPerfTagToken' + close;
            })).value.replace(/@jsPerfTagToken/, function () {
              // put highlighted JS into highlighted HTML
              return swappedScripts.pop();
            }
          );
        }

        // update hits once per page per session
        var hits = request.session.get('hits') || {};
        if (!hits[page.id]) {
          pagesService.updateHits(page.id)
          .then(function () {
            hits[page.id] = true;
            request.session.set('hits', hits);
          })
          // TODO: report error some place useful
          .catch(debug);
        }

        var own = request.session.get('own') || {};
        const isOwn = own[page.id];
        const isAdmin = request.session.get('admin');

        reply.view('test/index', {
          headTitle: page.title,
          benchmark: true,
          showAtom: {
            slug: request.path.slice(1) // remove slash
          },
          jsClass: true,
          isAdmin: isAdmin,
          // Don’t let robots index non-published test cases
          noIndex: page.visible === 'n' && (isOwn || isAdmin),
          pageInit: page.initHTML.includes('function init()'),
          hasPrep: hasPrep,
          hasSetupOrTeardown: hasSetupOrTeardown,
          stripped: stripped,
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

  // allows owner or admin to publish a test making it visible to the public
  server.route({
    method: 'GET',
    path: '/{testSlug}/{rev}/publish',
    handler: function (request, reply) {
      pagesService.getBySlug(request.params.testSlug, request.params.rev)
      .then(function (values) {
        const page = values[0];
        const own = request.session.get('own') || {};
        const isOwn = own[page.id];
        const isAdmin = request.session.get('admin');

        if (isOwn || isAdmin) {
          return pagesService.publish(page.id);
        }

        // whoever is requesting this doesn't own it so don't let them know it exists
        throw new Error('Not found');
      })
      .then(function () {
        debug('publish finished', arguments);
        reply.redirect(`/${request.params.testSlug}/${request.params.rev}`);
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

  server.route({
    method: 'GET',
    path: '/{testSlug}.atom',
    handler: (request, reply) => {
      pagesService.getVisibleBySlugWithRevisions(request.params.testSlug)
        .then(values => {
          const model = {
            page: values[0],
            revisions: values[1]
          };

          reply
            .view('test/index-atom', model, {
              layout: false
            })
            .header('Content-Type', 'application/atom+xml;charset=UTF-8')
            .header('Last-Modified', model.page.updated.toString());
        })
        .catch(err => {
          if (err.message === 'Not found') {
            reply(Boom.notFound('The page was not found'));
          } else {
            reply(err);
          }
        });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/test'
};
