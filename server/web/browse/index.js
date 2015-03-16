"use strict";

var _ = require("lodash");

var pagesRepo = require("../../repositories/pages");

exports.register = function(server, options, next) {

  var defaultContext = {
    headTitle: "Browse test cases",
    showAtom: true,
    ga: true
  };

  server.route({
    method: "GET",
    path: "/browse",
    handler: function(request, reply) {

      pagesRepo.getLatestVisible250(function(err, rows) {
        var result;

        if (err) {
          result = { genError: "Sorry. Could not find tests to browse." };
        } else {
          result = { pages: rows };
        }

        reply.view("browse/index", _.assign(defaultContext, result));
      });

    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/browse"
};
