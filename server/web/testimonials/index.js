"use strict";

exports.register = function(server, options, next) {

  server.route({
    method: "GET",
    path: "/testimonials",
    handler: function (request, reply) {
      reply.view("testimonials/index", {
        headTitle: "Testimonials",
        ga: true
      });
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/testimonials"
};
