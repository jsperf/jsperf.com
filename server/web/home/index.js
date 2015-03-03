"use strict";

var _ = require("lodash");
var Joi = require("joi");

var regex = require("../../lib/regex");

exports.register = function(server, options, next) {

  var mediumTextLength = 16777215;

  var defaultContext = {
    home: true,
    jsClass: true,
    mainJS: true,
    mediumTextLength: mediumTextLength,
    titleError: null,
    spamError: null,
    slugError: null,
    genError: null,
    slugPattern: regex.slug,
    author: "",
    authorEmail: "",
    authorURL: "",
    title: "",
    slug: "",
    visible: "",
    info: "",
    initHTML: "",
    setup: "",
    teardown: ""
  };

  var defaultTest = {
    title: "",
    defer: "",
    code: "",
    codeTitleError: null,
    codeError: null
  };

  server.route({
    method: "GET",
    path: "/",
    handler: function(request, reply) {
      reply.view("home/index", _.assign(defaultContext, {
        test: [defaultTest, defaultTest]
      }));
    }
  });

  server.route({
    method: "POST",
    path: "/",
    handler: function(request, reply) {

      var mediumText = Joi.string().max(mediumTextLength);

      var pageProperties = Joi.object().keys({
        author: Joi.string().allow("").min(1),
        authorEmail: Joi.string().allow("").email(),
        authorUrl: Joi.string().allow("").regex(new RegExp(regex.url, "i"), "url"),
        title: Joi.string().required().trim().min(1).max(255),
        slug: Joi.string().required().trim().lowercase().min(1).max(55).regex(new RegExp(regex.slug), "slug"),
        visible: Joi.string().default("n").valid("y", "n"),
        info: mediumText,
        question: Joi.valid("no"),
        initHtml: mediumText,
        setup: mediumText,
        teardown: mediumText,
        test: Joi.array().min(2).includes(Joi.object().required().keys({
          title: Joi.string().required().trim().min(1).max(255),
          defer: Joi.string().default("n").valid("y", "n"),
          code: Joi.string().required().trim().min(1).max(mediumTextLength)
        }))
      });

      Joi.validate(request.payload, pageProperties, function(err, page) {
        if (err) {
          var titleError = null;
          var spamError = null;
          var slugError = null;
          var genError = null;

          // `abortEarly` option defaults to `true` so can rely on 0 index
          // but just in case...
          try {
            var valErr = err.details[0];

            switch(valErr.path) {
              case "title":
                titleError = "You must enter a title for this test case.";
                break;
              case "question":
                spamError = "Please enter ‘no’ to prove you’re not a spammer.";
                break;
              case "slug":
                slugError = "The slug can only contain alphanumeric characters and hyphens.";
                break;
              default:
                // test errors are deeply nested because objects inside array
                var testErr = valErr.context.reason[0];
                var idx = testErr.path.split(".")[1];

                switch(testErr.context.key) {
                  case "title":
                    request.payload.test[idx].codeTitleError = "Please enter a title for this code snippet.";
                    break;
                  case "code":
                    request.payload.test[idx].codeError = "Please enter a code snippet.";
                    break;
                  default:
                    throw new Error("Validation error unknown");
                }
            }
          } catch (ex) {
            genError = "Please review required fields and save again.";
          }

          return reply.view("home/index", _.assign(defaultContext, request.payload, {
            titleError: titleError,
            spamError: spamError,
            slugError: slugError,
            genError: genError
          }));
        }

        // Joi defaults any properties not present in `request.payload` so use `page` from here on out
        console.log(page);

        // TODO browserfyid
        // TODO check if slug is available ($reservedSlugs, table)
        // TODO insert
        // TODO redirect
        reply(null, "cool");
      });
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/home"
};
