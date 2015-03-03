"use strict";

var pagesRepo = require("../repositories/pages");

module.exports = {
  checkIfSlugAvailable: function(server, slug) {
    return new Promise(function(resolve, reject) {
      // routes registered by the app should be considered reserved
      var routeTable = server.table();

      for (var i = 0, rtl = routeTable.length; i < rtl; i++) {
        for (var j = 0, rttl = routeTable[i].table.length; j < rttl; j++) {
          if (routeTable[i].table[j].path.substr(1) === slug) {
            return reject();
          }
        }
      }

      // does it exist in table?
      pagesRepo
        .get("id", { slug: slug })
        .then(function(row) {
          if (row) {
            resolve(false);
          } else {
            resolve(true);
          }
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  create: pagesRepo.create
};
