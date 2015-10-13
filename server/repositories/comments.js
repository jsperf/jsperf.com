// TODO make hapi plugin
var debug = require('debug')('jsperf:repositories:comments');
var db = require('../lib/db');

const table = 'comments';

module.exports = {
  findByPageID: function (pageID, cb) {
    debug('findByPageID', arguments);

    db.genericQuery(
      'SELECT * FROM ?? WHERE pageID = ? ORDER BY published ASC',
      [table, pageID],
      cb
    );
  }
};
