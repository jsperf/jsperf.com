"use strict";

var pagesService = require("../../services/pages");

exports.register = function(server, options, next) {

  server.route({
    method: "GET",
    path: "/search",
    handler: function(request, reply) {
      var defaultContext = {
        headTitle: "Search",
        ga: true,
        admin: false
      };

      var q = request.query.q;

      if (q && q.length > 0) {
        pagesService.find(q, function(err, results) {
          if (err) {
            reply(err);
          } else {
            if (results.length > 0) {
              defaultContext.pages = results;
            } else {
              defaultContext.genError = "No results found for query: " + q;
            }

            reply.view("search/results", defaultContext);
          }
        });
      } else {
        reply.view("search/form", defaultContext);
      }
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/search"
};
