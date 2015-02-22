"use strict";

exports.register = function(server, options, next) {

  server.route({
    method: "GET",
    path: "/@",
    handler: function(request, reply) {
      reply.redirect("https://twitter.com/jsperf").permanent();
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/redirects"
};
