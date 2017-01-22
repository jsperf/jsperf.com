const Joi = require('joi');
const regex = require('./regex');
const defaults = require('./defaults');

const mediumText = Joi.string().allow('').max(defaults.mediumTextLength);
const author = Joi.string().min(1);
const authorEmail = Joi.string().email();
const authorURL = Joi.string().allow('').regex(new RegExp(regex.url, 'i'), 'url');

exports.mediumText = mediumText;

exports.testPage = Joi.object().keys({
  author: author.allow(''),
  authorEmail: authorEmail.allow(''),
  authorURL,
  title: Joi.string().required().trim().min(1).max(255),
  slug: Joi.string().required().trim().min(1).max(55).regex(new RegExp(regex.slug), 'slug'),
  visible: Joi.string().default('n').valid('y', 'n'),
  info: mediumText,
  initHTML: mediumText,
  setup: mediumText,
  teardown: mediumText,
  test: Joi.array().required().min(2).items(Joi.object().required().keys({
    title: Joi.string().trim().allow('').empty('').max(255).when('code', {
      is: '',
      then: Joi.string().length(0), // must be blank too so can delete
      otherwise: Joi.string().min(1).required()
    }),
    code: Joi.string().trim().allow('').max(defaults.mediumTextLength),
    defer: Joi.string().default('n').valid('y', 'n'),
    testID: Joi.number().integer().optional() // only present when editing
  }))
});

exports.comment = Joi.object().keys({
  author: author.required(),
  authorEmail: authorEmail.required(),
  authorURL: authorURL.required(),
  message: Joi.string().min(1).max(defaults.mediumTextLength)
});
