'use strict';

const debug = require('debug')('jsperf:services:comments');

const commentsRepo = require('../repositories/comments');

module.exports = {
  create: (pageID, ip, payload) => {
    debug('create', payload);

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
  }
};
