'use strict';

const debug = require('debug')('jsperf:services:comments');

const commentsRepo = require('../repositories/comments');

module.exports = {
  create: (pageId, ip, payload) => {
    debug('create', payload);

    const comment = {
      pageID: pageId,
      author: payload.author,
      authorEmail: payload.authorEmail,
      authorURL: payload.authorURL,
      content: payload.message,
      ip: ip,
      published: new Date()
    };

    return commentsRepo.create(comment)
      .then(id => Object.assign(comment, {id}));
  }
};
