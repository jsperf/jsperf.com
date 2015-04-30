"use strict";

var testsRepo = require("../../repositories/tests");

exports.register = function(server, options, next) {

  server.route({
    method: "GET",
    path: "/sitemap.xml",
    handler: function(request, reply) {

      testsRepo.sitemap(function(err, items) {
        if (err) {
          reply(err);
        } else {
          reply
            .view("sitemap/xml", {
              items: items
            }, {
              layout: false
            })
            .header("Content-Type", "application/xml;charset=UTF-8");
        }
      });
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/sitemap"
};
