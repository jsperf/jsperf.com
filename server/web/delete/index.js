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
    path: '/{testSlug}/{rev}/delete',
    handler: function (request, reply) {
      var defaultContext = {
        message: '',
        headTitle: 'Delete'
      };

      if (!request.yar.get('admin')) {
        defaultContext.message = 'You do not have permissions to delete a test';
        return reply.view('delete/index', defaultContext).code(401);
      }

      const testSlug = request.params.testSlug;
      const rev = request.params.rev;

      pagesService.deleteBySlug(testSlug, rev).then(function (response) {
        const deletedRevisions = response;

        if (deletedRevisions === 1) {
          defaultContext.message = `Deleted revision ${rev}`;
        } else if (deletedRevisions > 1) {
          defaultContext.message = `Deleted ${deletedRevisions} revisions`;
        } else {
          defaultContext.message = 'Could not delete';
        }

        reply.view('delete/index', defaultContext);
      });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'web/delete',
  dependencies: ['services/pages']
};
