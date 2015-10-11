// TODO make hapi plugin
var _ = require('lodash');
var debug = require('debug')('jsperf:services:pages');

var pagesRepo = require('../repositories/pages');
var testsRepo = require('../repositories/tests');
var browserscopeRepo = require('../repositories/browserscope');
var commentsRepo = require('../repositories/comments');

module.exports = {
  checkIfSlugAvailable: function (server, slug, cb) {
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
    pagesRepo.get('id', { slug: slug }, function (err, row) {
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

  create: function (payload, cb) {
    browserscopeRepo.addTest(payload.title, payload.info, payload.slug, function (er, testKey) {
      if (er) {
        cb(er);
      } else {
        var page = _.omit(payload, 'test');
        page.browserscopeID = testKey;
        page.published = new Date();

        pagesRepo.create(page, function (err, pageID) {
          if (err) {
            cb(err);
          } else {
            testsRepo.bulkCreate(pageID, payload.test, cb);
          }
        });
      }
    });
  },

  getPopular: function (cb) {
    pagesRepo.getPopularRecent(function (er, recent) {
      if (er) {
        cb(er);
      } else {
        pagesRepo.getPopularAllTime(function (err, allTime) {
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
  },

  find: function (searchTerms, cb) {
    pagesRepo.find(searchTerms, cb);
  },

  updateHits: function (pageID, cb) {
    pagesRepo.updateHits(pageID, cb);
  },

  getBySlug: function (slug, rev, cb) {
    debug('getBySlug', arguments);
    // this waterfall w/ Promises mixed in was the most naive way to translate the PHP correctly
    // candidate for future refactoring

    // can we find the page?
    pagesRepo.getBySlug(slug, rev, function (er, pages) {
      if (er) {
        cb(er);
      } else {
        if (pages.length === 0) {
          cb(new Error('Not found'));
        } else {
          var page = pages[0];

          const p1 = new Promise(function (resolve, reject) {
            // update browserscopeID for page if missing
            if (page.browserscopeID && page.browserscopeID !== '') {
              resolve();
            } else {
              const s = page.revision > 1 ? page.slug + '/' + page.revision : page.slug;
              browserscopeRepo.addTest(page.title, page.info, s, function (e, testKey) {
                if (e) {
                  reject(e);
                } else {
                  page.browserscopeID = testKey;
                  pagesRepo.update({ browserscopeID: testKey }, { id: page.id }, function (ee) {
                    if (ee) {
                      reject(ee);
                    } else {
                      resolve();
                    }
                  });
                }
              });
            }
          });

          p1.then(function () {
            // find its tests
            testsRepo.findByPageID(page.id, function (err, tests) {
              if (err) {
                cb(err);
              } else {
                // find other revisions of page
                pagesRepo.findBySlug(slug, function (errr, revisions) {
                  if (errr) {
                    cb(errr);
                  } else {
                    // find comments for page
                    commentsRepo.findByPageID(page.id, function (errrr, comments) {
                      if (errrr) {
                        cb(errrr);
                      } else {
                        cb(null, page, tests, revisions, comments);
                      }
                    });
                  }
                });
              }
            });
          }).catch(cb);
        }
      }
    });
  }
};
