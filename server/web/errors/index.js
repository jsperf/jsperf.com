exports.register = function (server, options, next) {
  server.ext('onPreResponse', function (request, reply) {
    if (!request.response.isBoom) {
      return reply.continue();
    }

    const statusCode = request.response.output.statusCode;
    const handledCodes = {
      404: 'Not found',
      403: 'Forbidden',
      400: 'Bad Request'
    };

    if (handledCodes[statusCode]) {
      return reply.view('errors/' + statusCode).code(statusCode);
    }

    server.log(['debug'], request.response);
    return reply.view('errors/general').code(500);
  });

  return next();
};

exports.register.attributes = {
  name: 'web/errors'
};
