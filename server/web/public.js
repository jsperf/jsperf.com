"use strict";

exports.register = function(server, options, next) {

  // public assets like CSS and JS
  server.route({
    method: "GET",
    path: "/{path*}",
    handler: {
      directory: {
        path: "public",
        index: false,
        redirectToSlash: false
      }
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/assets"
};
