const Boom = require('boom');

exports.register = function (server, options, next) {
  const commentsService = server.plugins['services/comments'];

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
      if (!request.yar.get('admin')) {
        return reply(Boom.unauthorized('Unauthorized'));
      }

      commentsService.delete(request.params.commentId)
        .then(() => reply('Comment deleted'))
        .catch(reply);
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/comment',
  dependencies: ['services/comments']
};
