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

  findByPageID: function (pageID) {
    debug('findByPageID', arguments);

    return db.genericQuery('SELECT * FROM ?? WHERE pageID = ?', [table, pageID]);
  }
};
