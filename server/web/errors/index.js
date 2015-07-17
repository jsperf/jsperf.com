"use strict";

var debug = require("debug")("jsperf:web:errors");

exports.register = function(server, options, next) {

  server.ext("onPreResponse", function(request, reply) {
    if (!request.response.isBoom) {
      return reply.continue();
    }

    var statusCode = request.response.output.statusCode;
    var handledCodes = [404, 403, 400]; // This can eventually be cached glob call (redis backed?)

    if (handledCodes.some(function(handledCode) {
        return handledCode === statusCode;
      })) {
      return reply.view("errors/" + statusCode).code(statusCode);
    } else {
      debug(request.response);
      return reply.view("errors/general");
    }

  });

  return next();
};

exports.register.attributes = {
  name: "web/errors"
};
