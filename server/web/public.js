"use strict";

exports.register = function(server, options, next) {

  // public assets like CSS and JS
  server.route({
    method: "GET",
    path: "/public/{path*}",
    handler: {
      directory: {
        path: "public",
        index: false,
        redirectToSlash: false
      }
    }
  });

  server.route({
    method: "GET",
    path: "/robots.txt",
    handler: {
      file: "public/robots.txt"
    }
  });

  // TODO: should this be /public/ like non-precomposed?
  server.route({
    method: "GET",
    path: "/apple-touch-icon-precomposed.png",
    handler: {
      file: "public/apple-touch-icon-precomposed.png"
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/assets"
};
