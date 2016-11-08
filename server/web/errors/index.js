exports.register = function (server, options, next) {
  server.ext('onPreResponse', function (request, reply) {
    if (!request.response.isBoom) {
      return reply.continue();
    }

    const statusCode = request.response.output.statusCode;
    const handledCodes = [404, 403, 400]; // This can eventually be cached glob call (redis backed?)

    if (handledCodes.some((handledCode) => handledCode === statusCode)) {
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
