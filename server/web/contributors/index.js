"use strict";

exports.register = function(server, options, next) {

  server.route({
    method: "GET",
    path: "/contributors",
    handler: function (request, reply) {
      reply.view("contributors/index", {
        title: "Contributors",
        ga: true
      });
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/contributors"
};
