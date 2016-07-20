// TODO make hapi plugin
const debug = require('debug')('jsperf:repositories:comments');
const db = require('../lib/db');

const table = 'comments';

module.exports = {
  findByPageID: function (pageID) {
    debug('findByPageID', arguments);

    return db.genericQuery(
      'SELECT * FROM ?? WHERE pageID = ? ORDER BY published ASC',
      [table, pageID]
    );
  },

  create: function (payload) {
    debug('create', arguments);

    return db.genericQuery('INSERT INTO ?? SET ?', [table, payload])
      .then(result => result.insertId);
  },

  delete: function (commentId) {
    debug('delete', arguments);

    return db.genericQuery('DELETE FROM ?? WHERE id = ?', [table, commentId]);
  }
};
