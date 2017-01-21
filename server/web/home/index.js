const _assign = require('lodash.assign');
const Joi = require('joi');
const defaults = require('../../lib/defaults');
const schema = require('../../lib/schema');

exports.register = function (server, options, next) {
  const pagesService = server.plugins['services/pages'];

  server.route({
    method: 'GET',
    path: '/',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      }
    },
    handler: function (request, reply) {
      reply.view('home/index', _assign({}, defaults.testPageContext, {
        home: true,
        showAtom: {
          slug: 'browse'
        },
        jsClass: true,
        mainJS: true,
        test: [defaults.test, defaults.test],
        authorized: request.auth.isAuthenticated
      }));
    }
  });

  server.route({
    method: 'POST',
    path: '/',
    config: {
      auth: 'session'
    },
    handler: function (request, reply) {
      var errResp = function (errObj) {
        if (errObj.message) {
          errObj.genError = errObj.message;
        }
        reply.view('home/index', _assign({}, defaults.testPageContext, request.payload, {
          home: true,
          showAtom: {
            slug: 'browse'
          },
          jsClass: true,
          mainJS: true,
          authorized: request.auth.isAuthenticated
        }, errObj)).code(400);
      };

      Joi.validate(request.payload, schema.testPage, function (er, pageWithTests) {
        if (er) {
          var errObj = {};
          // `abortEarly` option defaults to `true` so can rely on 0 index
          // but just in case...
          try {
            const valErr = er.details[0];

            switch (valErr.path) {
              case 'title':
                errObj.titleError = defaults.errors.title;
                break;
              case 'slug':
                errObj.slugError = defaults.errors.slug;
                break;
              default:
                const idx = valErr.path.split('.')[1];
                switch (valErr.context.key) {
                  case 'title':
                    request.payload.test[idx].codeTitleError = defaults.errors.codeTitle;
                    break;
                  case 'code':
                    request.payload.test[idx].codeError = defaults.errors.code;
                    break;
                  default:
                    throw new Error('unknown validation error');
                }
            }
          } catch (ex) {
            errObj.genError = defaults.errors.general;
          }
          errResp(errObj);
        } else {
          // Joi defaults any properties not present in `request.payload` so use `payload` from here on out
          var payload = pageWithTests;

          pagesService.checkIfSlugAvailable(server, payload.slug)
          .then(isAvail => {
            if (!isAvail) {
              errResp({
                slugError: defaults.errors.slugDupe
              });
            } else {
              return pagesService.create(payload)
              .then(resultPageId => {
                const own = request.yar.get('own') || {};
                own[resultPageId] = true;
                request.yar.set('own', own);
                request.yar.set('authorSlug', payload.author.replace(' ', '-').replace(/[^a-zA-Z0-9 -]/, ''));
                reply.redirect('/' + payload.slug);
              });
            }
          })
          .catch(errResp);
        }
      });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/home',
  dependencies: ['services/pages']
};
