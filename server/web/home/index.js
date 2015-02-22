"use strict";

exports.register = function(server, options, next) {

  server.route({
    method: "GET",
    path: "/",
    handler: function (request, reply) {
      reply.view("home/index");
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/home"
};
