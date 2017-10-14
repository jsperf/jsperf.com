const Boom = require('boom');
const defaults = require('../../lib/defaults');
const schema = require('../../lib/schema');
const Hoek = require('hoek');
const Joi = require('joi');

exports.register = function (server, options, next) {
  const pagesService = server.plugins['services/pages'];

  server.route({
    method: 'GET',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      }
    },
    path: '/{testSlug}/{rev}/edit',
    handler: function (request, reply) {
      pagesService.getBySlug(request.params.testSlug, request.params.rev)
        .then(function (values) {
          let page = values[0];
          page.test = values[1];
          page.revision = values[2];
          const own = request.yar.get('own') || {};
          const isOwn = own[page.id];
          const isAdmin = request.yar.get('admin');

          reply.view('edit/index', {
            headTitle: page.title,
            benchmark: false,
            mainJS: true,
            showAtom: {
              slug: request.path.slice(1) // remove slash
            },
            jsClass: true,
            isOwn: isOwn,
            isAdmin: isAdmin,
            page: page,
            mediumTextLength: defaults.mediumTextLength
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

  server.route({
    method: 'POST',
    path: '/{testSlug}/{rev}/edit',
    config: {
      auth: {
        strategy: 'session'
      }
    },
    handler: function (request, reply) {
      const errResp = function (errObj) {
        if (errObj.message) {
          errObj.genError = errObj.message;
        }
        let page = Hoek.applyToDefaults(defaults.testPageContext, request.payload, true);
        Hoek.merge(page, errObj);
        reply.view('edit/index', {
          headTitle: page.title,
          benchmark: false,
          mainJS: true,
          showAtom: {
            slug: request.path.slice(1) // remove slash
          },
          jsClass: true,
          page: page,
          mediumTextLength: defaults.mediumTextLength
        }).code(400);
      };

      Joi.validate(request.payload, schema.testPage, function (err, pageWithTests) {
        let errObj = {};
        if (err) {
          server.log(['error'], err);
          try {
            if (err.details[0].path[0] === 'title') {
              errObj.titleError = defaults.errors.title;
            } else {
              throw err;
            }
          } catch (ex) {
            server.log(['error'], ex);
            errObj.genError = defaults.errors.general;
          }
          errResp(errObj);
        } else {
          // additional validation that's not possible or insanely complex w/ Joi
          let wasAdditionalValidationError = false;
          pageWithTests.test.forEach((t, idx) => {
            const missingTitle = t.title === defaults.deleteMe;
            const missingCode = t.code === defaults.deleteMe;

            if (missingTitle && !missingCode) {
              wasAdditionalValidationError = true;
              request.payload.test[idx].codeTitleError = defaults.errors.codeTitle;
            }

            if (missingCode && !missingTitle) {
              wasAdditionalValidationError = true;
              request.payload.test[idx].codeError = defaults.errors.code;
            }
          });

          if (wasAdditionalValidationError) {
            errResp(errObj);
          } else {
            let isOwn = false;

            pagesService.getBySlug(request.params.testSlug, request.params.rev)
              .then(values => {
                const prevPage = values[0];
                const own = request.yar.get('own') || {};
                isOwn = own[prevPage.id];
                const isAdmin = request.yar.get('admin');
                let update = !!(isAdmin || isOwn);
                server.log('debug', `isAdmin: ${isAdmin} isOwn: ${isOwn} update: ${update}`);
                return pagesService.edit(pageWithTests, update, prevPage.maxRev, prevPage.id);
              })
              .then(resultingRevision => {
                request.yar.set('authorSlug', pageWithTests.author.replace(' ', '-').replace(/[^a-zA-Z0-9 -]/, ''));

                const r = resultingRevision > 1 ? `/${resultingRevision}` : '';

                reply.redirect(`/${request.params.testSlug}${r}`);
              }).catch(errResp);
          }
        }
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/{testSlug}/edit',
    handler: function (request, reply) {
      reply.redirect(`/${request.params.testSlug}/1/edit`);
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/edit',
  dependencies: ['services/pages']
};
