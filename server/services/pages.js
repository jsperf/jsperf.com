const _omit = require('lodash.omit');

const name = 'services/pages';

exports.register = function (server, options, next) {
  const pagesRepo = server.plugins['repositories/pages'];
  const testsRepo = server.plugins['repositories/tests'];
  const browserscopeRepo = server.plugins['repositories/browserscope'];
  const commentsRepo = server.plugins['repositories/comments'];

  server.expose('checkIfSlugAvailable', function (server, slug) {
    return new Promise(function (resolve, reject) {
      // routes registered by the app should be considered reserved
      var routeTable = server.table();

      for (var i = 0, rtl = routeTable.length; i < rtl; i++) {
        for (var j = 0, rttl = routeTable[i].table.length; j < rttl; j++) {
          if (routeTable[i].table[j].path.substr(1) === slug) {
            return resolve(false);
          }
        }
      }

      // does it exist in table?
      pagesRepo.get('id', { slug: slug })
        .then(function (row) {
          resolve(!row);
        })
        .catch(reject);
    });
  });

  server.expose('create', function (payload) {
    return browserscopeRepo.addTest(payload.title, payload.info, payload.slug)
      .then(function (testKey) {
        var page = _omit(payload, 'test');
        if (testKey) {
          page.browserscopeID = testKey;
        }
        page.published = new Date();

        return pagesRepo.create(page);
      })
      .then(function (pageID) {
        return testsRepo.bulkCreate(pageID, payload.test);
      });
  });

  server.expose('edit', function (payload, isOwn, maxRev, pageId) {
    let newRev = ++maxRev;
    return browserscopeRepo.addTest(payload.title, payload.info, payload.slug, newRev)
      .then(testKey => {
        let page = _omit(payload, 'test');
        if (testKey) {
          page.browserscopeID = testKey;
        }
        if (isOwn) {
          return pagesRepo.updateById(page, pageId);
        } else {
          page.published = new Date();
          page.revision = newRev;
          return pagesRepo.create(page);
        }
      })
      .then(function (pageID) {
        return testsRepo.bulkUpdate(pageID, payload.test, isOwn);
      });
  });

  server.expose('getPopular', function () {
    return Promise.all([
      pagesRepo.getPopularRecent(),
      pagesRepo.getPopularAllTime()
    ])
      .then(function (values) {
        return {
          recent: values[0],
          allTime: values[1]
        };
      });
  });

  server.expose('find', function () {
    return pagesRepo.find.apply(this, arguments);
  });

  server.expose('updateHits', function () {
    return pagesRepo.updateHits.apply(this, arguments);
  });

  server.expose('getBySlug', function (slug, rev) {
    server.log(['debug'], `${name}::getBySlug: ${JSON.stringify(arguments)}`);
    var page;
    const values = [];

    // can we find the page?
    return pagesRepo.getBySlug(slug, rev)
      .then(function (pages) {
        if (pages.length === 0) {
          throw new Error('Not found');
        }

        page = pages[0];
        values.push(page);

        return new Promise(function (resolve, reject) {
          // update browserscopeID for page if missing
          if (page.browserscopeID && page.browserscopeID !== '') {
            return resolve();
          }

          const s = page.revision > 1 ? page.slug + '/' + page.revision : page.slug;

          browserscopeRepo.addTest(page.title, page.info, s)
            .then(function (testKey) {
              if (testKey) {
                page.browserscopeID = testKey;
                pagesRepo.update({ browserscopeID: testKey }, { id: page.id })
                .then(resolve)
                .catch(reject);
              } else {
                resolve();
              }
            });
        });
      })
      .then(function () {
        // find its tests
        return testsRepo.findByPageID(page.id);
      })
      .then(function (tests) {
        // find other revisions of page
        values.push(tests);
        return pagesRepo.findBySlug(slug);
      })
      .then(function (revisions) {
        // find comments for page
        values.push(revisions);
        return commentsRepo.findByPageID(page.id);
      })
      .then(function (comments) {
        values.push(comments);
        return values;
      });
  });

  server.expose('getVisibleBySlugWithRevisions', function (slug) {
    server.log(['debug'], `${name}::getVisibleBySlugWithRevisions ${JSON.stringify(arguments)}`);
    const values = [];

    // can we find the page?
    return pagesRepo.getVisibleBySlug(slug, 1)
      .then(pages => {
        if (pages.length === 0) {
          throw new Error('Not found');
        }

        values.push(pages[0]);

        // find other revisions of page
        return pagesRepo.findVisibleBySlug(slug);
      })
      .then(revisions => {
        values.push(revisions);
        return values;
      });
  });

  server.expose('deleteBySlug', function (slug, rev) {
    server.log(['debug'], `${name}::deleteBySlug ${JSON.stringify(arguments)}`);

    if (rev > 1) {
      return pagesRepo.deleteOneRevisionBySlug(slug, rev);
    } else {
      return pagesRepo.deleteAllRevisionsBySlug(slug);
    }
  });

  server.expose('publish', function (pageID) {
    const now = new Date();
    const modify = {
      visible: 'y',
      updated: now,
      published: now
    };

    server.log(['debug'], `${name}::publish ${pageID} ${modify}`);
    return pagesRepo.updateById(modify, pageID);
  });

  return next();
};

exports.register.attributes = {
  name,
  dependencies: [
    'repositories/browserscope',
    'repositories/comments',
    'repositories/pages',
    'repositories/tests'
  ]
};
