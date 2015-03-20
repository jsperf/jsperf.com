"use strict";

var pagesRepo = require("../../repositories/pages");

var getUpdatedDate = function(results) {
  var updated;

  if (results.length === 0) {
    updated = new Date();
  } else {
    updated = results[0].updated;
  }

  return updated;
};

exports.register = function(server, options, next) {

  server.route({
    method: "GET",
    path: "/browse",
    handler: function(request, reply) {

      pagesRepo.getLatestVisible(250, function(err, rows) {
        var context = {
          headTitle: "Browse test cases",
          showAtom: {
            slug: "browse"
          },
          ga: true
        };

        if (err) {
          context.genError = "Sorry. Could not find tests to browse.";
        } else {
          context.pages = rows;
        }

        reply.view("browse/index", context);
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
          var updated = getUpdatedDate(rows);

          reply
            .view("browse/index-atom", {
              updated: updated.toISOString(),
              entries: rows
            }, {
              layout: false
            })
            .header("Content-Type", "application/atom+xml;charset=UTF-8")
            .header("Last-Modified", updated.toString());
        }
      });
    }
  });

  server.route({
    method: "GET",
    path: "/browse/{authorSlug}",
    handler: function(request, reply) {

      pagesRepo.getLatestVisibleForAuthor(request.params.authorSlug, function(err, rows) {
        if (err) {
          reply(err);
        } else {
          if (rows.length === 0) {
            reply("The author was not found").code(404);
          } else {
            reply.view("browse/author", {
              headTitle: "Test cases by " + request.params.authorSlug,
              showAtom: {
                slug: "browse/" + request.params.authorSlug
              },
              ga: true,
              author: request.params.authorSlug,
              pages: rows
            });
          }
        }
      });
    }
  });

  server.route({
    method: "GET",
    path: "/browse/{authorSlug}.atom",
    handler: function(request, reply) {

      pagesRepo.getLatestVisibleForAuthor(request.params.authorSlug, function(err, rows) {
        if (err) {
          reply(err);
        } else {
          var updated = getUpdatedDate(rows);

          reply.view("browse/author-atom", {
            author: request.params.authorSlug,
            update: updated.toISOString,
            entries: rows
          }, {
            layout: false
          })
          .header("Content-Type", "application/atom+xml;charset=UTF-8")
          .header("Last-Modified", updated.toString());
        }
      });
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/browse"
};
