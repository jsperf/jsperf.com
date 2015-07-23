"use strict";

var Boom = require("boom");
var debug = require("debug")("jsperf:web:test");
var hljs = require("highlight.js");
var pagesService = require("../../services/pages");
var regex = require("../../lib/regex");

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
          page.test = tests;
          page.revision = revisions;
          page.comment = comments;

          let isAdmin = request.session.get("admin");

          let hasSetupOrTeardown = page.setup.length || page.teardown.length;
          let stripped = false;

          if (page.initHTML.length || hasSetupOrTeardown) {
            let reScripts = new RegExp(regex.script, "i");
            stripped = page.initHTML.replace(reScripts, "");

            let swappedScripts = [];

            page.initHTMLHighlighted = hljs(page.initHTML.replace(reScripts, function(match, open, contents, close) {
              let highlightedContents = hljs(contents, "js").value;
              swappedScripts.unshift(highlightedContents.replace(/&nbsp;%/, ""));
              return open + "@jsPerfTagToken" + close;
            }), "html").value.replace(/@jsPerfTagToken/, function() {
              return swappedScripts.pop();
            });
          }

          // update hits once per page per session
          let hits = request.session.get("hits") || {};
          if (!hits[page.id]) {
            pagesService.updateHits(page.id, function(e) {
              // TODO: report error some place useful
              if (e) {
                debug(e);
              }

              hits[page.id] = true;
              request.session.set("hits", hits);
            });
          }

          reply.view("test/index", {
            benchmark: true,
            showAtom: {
              slug: request.path.slice(1) // remove slash
            },
            jsClass: true,
            // Don’t let robots index non-published test cases
            noIndex: page.visible === "n" && (request.session.get("own")[page.id] || isAdmin),
            pageInit: page.initHTML.includes("function init()"),
            hasPrep: page.initHTML.length || hasSetupOrTeardown,
            hasSetupOrTeardown: hasSetupOrTeardown,
            stripped: stripped,
            page: page
          });
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
