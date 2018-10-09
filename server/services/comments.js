const name = 'services/comments';
exports.register = function (server, options, next) {
  const commentsRepo = server.plugins['repositories/comments'];

  server.expose('create', function (pageID, ip, payload) {
    server.log(['debug'], `${name}::create: ${JSON.stringify(arguments)}`);

    const comment = {
      pageID,
      author: payload.author,
      authorEmail: payload.authorEmail,
      authorURL: payload.authorURL,
      authorGitHub: payload.authorGitHub,
      content: payload.message,
      ip,
      published: new Date()
    };

    return commentsRepo.create(comment)
      .then(id => Object.assign(comment, {id}));
  });

  server.expose('delete', function (commentId) {
    server.log(['debug'], `${name}::delete: ${JSON.stringify(arguments)}`);

    return commentsRepo.delete(commentId);
  });

  return next();
};

exports.register.attributes = {
  name,
  dependencies: ['repositories/comments']
};
