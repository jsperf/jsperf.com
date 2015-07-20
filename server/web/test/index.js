"use strict";

var Boom = require("boom");
var debug = require("debug")("jsperf:web:test");
var pagesService = require("../../services/pages");

exports.register = function(server, options, next) {

  server.route({
    method: "GET",
    path: "/{testSlug}/{rev?}",
    handler: function(request, reply) {
      var rev = request.params.rev ? request.params.rev : 1;

      pagesService.getBySlug(request.params.testSlug, rev, function(err, page, tests, revisions, comments) {
        if (err) {
          if (err.message === "Not found") {
            reply(Boom.notFound("The page was not found"));
          } else {
            reply(err);
          }
        } else {
          let context = {
            benchmark: true,
            showAtom: {
              slug: request.path.slice(1) // remove slash
            },
            jsClass: true,
            userAgent: request.headers["user-agent"]
          };

          // update hits once per page per session
          let hits = request.session.get("hits") || {};
          if (!(hits && hits[page.id])) {
            pagesService.updateHits(page.id, function(e) {
              // TODO: report error some place useful
              if (e) {
                debug(e);
              }

              hits[page.id] = true;
              request.session.set("hits", hits);
            });
          }

          context.isAdmin = request.session.get("admin");

          // Don’t let robots index non-published test cases
          if (page.visible === "n" && (request.session.get("own")[page.id] || context.isAdmin)) {
            context.noIndex = true;
          }

          if (page.initHTML.includes("function init()")) {
            context.pageInit = true;
          }

          context.page = page;
          page.test = tests;
          page.revision = revisions;
          page.comment = comments;

          reply.view("test/index", context);
        }
      });
    }
  });

  // TODO: atom feed

  return next();

};

exports.register.attributes = {
  name: "web/test"
};
