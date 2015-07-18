"use strict";

var debug = require("debug")("jsperf:web:test");
var pagesService = require("../../services/pages");

exports.register = function(server, options, next) {

  server.route({
    method: "GET",
    path: "/{testSlug}",
    handler: function(request, reply) {
      // TODO: get rev from params or query or ???
      var rev = 1;
      pagesService.getBySlug(request.params.testSlug, rev, function(err, page, tests, revisions, comments) {
        if (err) {
          if (err.message === "Not found") {
            reply("The page was not found").code(404);
          } else {
            reply(err);
          }
        } else {
          let hits = request.session.get("hits");
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

          // TODO: update browserscopeID for page if missing
          /*
          if (in_array($item->browserscopeID, array(NULL, ''))) {
  $item->browserscopeID = addBrowserscopeTest($item->title, $item->info, 'http://' . DOMAIN . '/' . $item->slug . ($item->revision > 1 ? '/' . $item->revision : ''));
  $sql = 'UPDATE pages SET browserscopeID = "' . $db->real_escape_string($item->browserscopeID) . '" WHERE id = ' . $item->id . "\n";
  $db->query($sql);
  }
          */

          // TODO: Don’t let robots index non-published test cases
          /*
          if ($item->visible === 'n' && (isset($_SESSION['own'][$item->id]) || isset($_SESSION['admin']))) {
            $noIndex = true;
          }
          */
          // TODO: fix collisions between `page` properties and associations
          page.test = tests;
          page.revision = revisions;
          page.comment = comments;

          reply.view("test/index", page);
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
