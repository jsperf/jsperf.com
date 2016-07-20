'use strict';

const debug = require('debug')('jsperf:services:comments');

const commentsRepo = require('../repositories/comments');

module.exports = {
  create: function (pageID, ip, payload) {
    debug('create', arguments);

    const comment = {
      pageID,
      author: payload.author,
      authorEmail: payload.authorEmail,
      authorURL: payload.authorURL,
      content: payload.message,
      ip,
      published: new Date()
    };

    return commentsRepo.create(comment)
      .then(id => Object.assign(comment, {id}));
  },

  delete: function (commentId) {
    debug('delete', arguments);

    return commentsRepo.delete(commentId);
  }
};
