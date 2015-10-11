// TODO make hapi plugin
var debug = require('debug')('jsperf:repositories:tests');
var db = require('../lib/db');

const table = 'tests';

module.exports = {
  bulkCreate: function (pageID, tests, cb) {
    var columns = ['pageID', 'title', 'defer', 'code'];

    var values = [];
    for (var i = 0, tl = tests.length; i < tl; i++) {
      var test = tests[i];
      values.push('(' + pageID + ', ' + db.escape(test.title) + ', ' + db.escape(test.defer) + ', ' + db.escape(test.code) + ')');
    }

    values = values.join(', ');

    db.genericQuery('INSERT INTO ?? (??) VALUES ' + values, [table, columns], function (err, result) {
      if (err) {
        cb(err);
      } else if (result.affectedRows !== tests.length) {
        cb(new Error('Not all tests inserted'));
      } else {
        cb(null);
      }
    });
  },

  findByPageID: function (pageID, cb) {
    debug('findByPageID', arguments);

    db.genericQuery(
      'SELECT * FROM ?? WHERE pageID = ?',
      [table, pageID],
      cb
    );
  }
};
