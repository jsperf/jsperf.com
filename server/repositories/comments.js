// TODO make hapi plugin
var debug = require('debug')('jsperf:repositories:comments');
var db = require('../lib/db');

const table = 'comments';

module.exports = {
  findByPageID: function (pageID) {
    debug('findByPageID', arguments);

    return db.genericQuery(
      'SELECT * FROM ?? WHERE pageID = ? ORDER BY published ASC',
      [table, pageID]
    );
  },

  delete: commentId => {
    debug('delete', {commentId});

    return db.genericQuery(
      'DELETE FROM ?? WHERE id = ?',
      [table, commentId]
    );
  }
};
