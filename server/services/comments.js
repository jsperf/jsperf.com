'use strict';

const debug = require('debug')('jsperf:services:comments');

const commentsRepo = require('../repositories/comments');

module.exports = {
  delete: (commentId) => {
    debug('delete', commentId);

    return commentsRepo.delete(commentId);
  }
};
