"use strict";

var _ = require("lodash");

var pagesRepo = require("../../repositories/pages");

exports.register = function(server, options, next) {

  var defaultContext = {
    headTitle: "Browse test cases",
    showAtom: {
      slug: "browse"
    },
    ga: true
  };

  server.route({
    method: "GET",
    path: "/browse",
    handler: function(request, reply) {

      pagesRepo.getLatestVisible(250, function(err, rows) {
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

  server.route({
    method: "GET",
    path: "/browse.atom",
    handler: function(request, reply) {
      pagesRepo.getLatestVisible(20, function(err, rows) {
        if (err) {
          reply(err);
        } else {
          reply
            .view("browse/atom", {
              updated: rows[0].updated.toISOString(),
              entries: rows
            }, {
              layout: false
            })
            .header("Content-Type", "application/atom+xml;charset=UTF-8")
            .header("Last-Modified", rows[0].updated.toString());
        }
      });
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/browse"
};
