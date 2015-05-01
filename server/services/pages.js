"use strict";

var _ = require("lodash");

var pagesRepo = require("../repositories/pages");
var testsRepo = require("../repositories/tests");
var browserscopeRepo = require("../repositories/browserscope");

module.exports = {
  checkIfSlugAvailable: function(server, slug, cb) {
    // routes registered by the app should be considered reserved
    var routeTable = server.table();

    for (var i = 0, rtl = routeTable.length; i < rtl; i++) {
      for (var j = 0, rttl = routeTable[i].table.length; j < rttl; j++) {
        if (routeTable[i].table[j].path.substr(1) === slug) {
          return cb(null, false);
        }
      }
    }

    // does it exist in table?
    pagesRepo.get("id", { slug: slug }, function(err, row) {
      if (err) {
        cb(err);
      } else {
        if (row) {
          cb(null, false);
        } else {
          cb(null, true);
        }
      }
    });
  },

  create: function(payload, cb) {
    browserscopeRepo.addTest(payload.title, payload.info, payload.slug, function(er, testKey) {
      if (er) {
        cb(er);
      } else {
        var page = _.omit(payload, "question", "test");
        page.browserscopeID = testKey;
        page.published = new Date();

        pagesRepo.create(page, function(err, pageID) {
          if (err) {
            cb(err);
          } else {
            testsRepo.bulkCreate(pageID, payload.test, cb);
          }
        });
      }
    });
  },

  getPopular: function(cb) {
    pagesRepo.getPopularRecent(function(er, recent) {
      if (er) {
        cb(er);
      } else {
        pagesRepo.getPopularAllTime(function(err, allTime) {
          if (err) {
            cb(err);
          } else {
            cb(null, {
              recent: recent,
              allTime: allTime
            });
          }
        });
      }
    });
  }
};
