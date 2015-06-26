"use strict";

var pagesService = require("../../services/pages");

exports.register = function(server, options, next) {

  server.route({
    method: "GET",
    path: "/search",
    handler: function(request, reply) {
      var query = request.query.q;
      pagesService.getSearch(query)
        .then(function (search) {
          reply.view("search/index", {
            headTitle: "Search",
            ga: true,
            admin: false,
            results: search.results
          });
        })
        .catch(reply);
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/search"
};
