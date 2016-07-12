'use strict';

var Boom = require('boom');
var commentsService = require('../../services/comments');

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      }
    },
    path: '/comment/delete/{commentId}',
    handler: function (request, reply) {
      if (!request.session.get('admin')) {
        return reply(Boom.unauthorized('Unauthorized'));
      }

      commentsService.delete(request.params.commentId)
        .then(() => reply('Comment deleted.'))
        .catch(err => reply(err));
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/comment'
};
