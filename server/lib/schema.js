const Joi = require('joi');
const regex = require('./regex');
const defaults = require('./defaults');

const mediumText = Joi.string().allow('').max(defaults.mediumTextLength);

exports.mediumText = mediumText;
exports.testPage = Joi.object().keys({
  author: Joi.string().allow('').min(1),
  authorEmail: Joi.string().allow('').email(),
  authorURL: Joi.string().allow('').regex(new RegExp(regex.url, 'i'), 'url'),
  title: Joi.string().required().trim().min(1).max(255),
  slug: Joi.string().required().trim().min(1).max(55).regex(new RegExp(regex.slug), 'slug'),
  visible: Joi.string().default('n').valid('y', 'n'),
  info: mediumText,
  initHTML: mediumText,
  setup: mediumText,
  teardown: mediumText,
  test: Joi.array().required().min(2).includes(Joi.object().required().keys({
    title: Joi.string().required().trim().min(1).max(255),
    defer: Joi.string().default('n').valid('y', 'n'),
    code: Joi.string().required().trim().min(1).max(defaults.mediumTextLength)
  }))
});
