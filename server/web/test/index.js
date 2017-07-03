const Boom = require('boom');
const hljs = require('highlight.js');
const regex = require('../../lib/regex');
const Joi = require('joi');
const schema = require('../../lib/schema');
const defaults = require('../../lib/defaults');

exports.register = function (server, options, next) {
  const pagesService = server.plugins['services/pages'];
  const commentsService = server.plugins['services/comments'];

  const getTestPage = (request) => {
    return pagesService.getBySlug(request.params.testSlug, request.params.rev || 1)
      .then(values => {
        var page = values[0];
        page.test = values[1];
        page.revisions = values[2];
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
              var highlightedContents = hljs.highlight('js', contents, true).value;
              // store to put back in place later
              swappedScripts.unshift(highlightedContents.replace(/&nbsp;$/, ''));
              // insert marker to replace shortly
              return open + '@jsPerfTagToken' + close;
            }), true).value.replace(/@jsPerfTagToken/, function () {
            // put highlighted JS into highlighted HTML
            return swappedScripts.pop();
          }
          );
        }

        // update hits once per page per session
        var hits = request.yar.get('hits') || {};
        if (!hits[page.id]) {
          pagesService.updateHits(page.id)
            .then(function () {
              hits[page.id] = true;
              request.yar.set('hits', hits);
            })
            .catch((err) => {
              server.log(['error'], err);
            });
        }

        var own = request.yar.get('own') || {};
        const isOwn = own[page.id];
        const isAdmin = request.yar.get('admin');

        return {
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
        };
      })
      .catch((err) => {
        if (err.message === 'Not found') {
          err = Boom.notFound('The page was not found');
        }

        return Promise.reject(err);
      });
  };

  server.route({
    method: 'GET',
    path: '/{testSlug}/{rev?}',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      }
    },
    handler: function (request, reply) {
      getTestPage(request)
        .then((model) => {
          model.userAgent = request.plugins.scooter.toString();
          model.mediumTextLength = defaults.mediumTextLength;
          reply.view('test/index', model);
        })
        .catch(reply);
    }
  });

  // comment route
  server.route({
    method: 'POST',
    path: '/{testSlug}/{rev?}',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      }
    },
    handler: (request, reply) => {
      if (!request.auth.isAuthenticated) {
        return reply(Boom.unauthorized('Unauthorized'));
      }

      getTestPage(request)
        .then((model) => {
          const result = Joi.validate(request.payload, schema.comment, {abortEarly: false});
          if (result.error) {
            let errObj = {};

            result.error.details.forEach(detail => {
              let errMsg = defaults.errors.comment[detail.path];
              if (errMsg) {
                errObj[`${detail.path}Error`] = errMsg;
              }
            });

            model.mediumTextLength = defaults.mediumTextLength;
            reply.view('test/index', Object.assign(model, errObj, request.payload));
          } else {
            const ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
            return commentsService.create(model.page.id, ip, result.value)
              .then((comment) => {
                model.page.comments.push(comment);
                model.mediumTextLength = defaults.mediumTextLength;
                reply.view('test/index', model);
              });
          }
        })
        .catch(reply);
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
          const own = request.yar.get('own') || {};
          const isOwn = own[page.id];
          const isAdmin = request.yar.get('admin');

          if (isOwn || isAdmin) {
            return pagesService.publish(page.id);
          }

          // whoever is requesting this doesn't own it so don't let them know it exists
          throw new Error('Not found');
        })
        .then(function () {
          server.log(['debug'], 'publish finished: ' + JSON.stringify(arguments));
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
  name: 'web/test',
  dependencies: ['services/pages', 'services/comments']
};
