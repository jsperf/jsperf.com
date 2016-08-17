'use strict';
// TODO make hapi plugin
var debug = require('debug')('jsperf:repositories:tests');
var db = require('../lib/db');

const table = 'tests';

module.exports = {
  bulkCreate: function (pageID, tests) {
    var columns = ['pageID', 'title', 'defer', 'code'];

    var values = [];
    for (var i = 0, tl = tests.length; i < tl; i++) {
      var test = tests[i];
      values.push('(' + pageID + ', ' + db.escape(test.title) + ', ' + db.escape(test.defer) + ', ' + db.escape(test.code) + ')');
    }

    values = values.join(', ');

    return db.genericQuery('INSERT INTO ?? (??) VALUES ' + values, [table, columns])
      .then(function (result) {
        if (result.affectedRows !== tests.length) {
          throw new Error('Not all tests inserted');
        }
      });
  },

  bulkUpdate: function (pageID, tests, update) {
    const columns = ['pageID', 'title', 'defer', 'code'];
    let queries = [];

    tests.forEach(test => {
      // FIXME
      if (!test.title && !test.code) {
        if (update && test.id) {
          queries.push(db.genericQuery(`DELETE FROM tests WHERE pageID = ${pageID} AND testID = ${test.id}`));
        }
      } else {
        // Update test
        if (test.id) {
          queries.push(db.genericQuery(`UPDATE tests SET title = ${db.escape(test.title)}, defer =  ${db.escape(test.defer)} , code =  ${db.escape(test.code)} WHERE pageID = ${pageID} AND testID = ${test.id}`));
        } else {
          queries.push(db.genericQuery(`INSERT INTO ?? (??) VALUES (${pageID}, ${db.escape(test.title)}, ${db.escape(test.defer)}, ${db.escape(test.code)})`, [table, columns]));
        }
      }
    });
    return Promise.all(queries).then((results) => {
      debug('bulkUpdate results', results);
      results.forEach((result) => {
        debug('bulkUpdate result', result);
        if (result.affectedRows !== 1) {
          throw new Error('Not all tests inserted');
        }
      });

      return Promise.resolve(results);
    });
  },

  findByPageID: function (pageID) {
    debug('findByPageID', arguments);

    return db.genericQuery('SELECT * FROM ?? WHERE pageID = ?', [table, pageID]);
  }
};
