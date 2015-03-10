"use strict";

var _ = require("lodash");
var Joi = require("joi");

var regex = require("../../lib/regex");

var pagesService = require("../../services/pages");

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

      var errResp = function(errObj) {
        if (errObj.message) {
          errObj.genError = errObj.message;
        }

        reply.view("home/index", _.assign(defaultContext, request.payload, errObj));
      };

      var mediumText = Joi.string().allow("").max(mediumTextLength);

      var pageProperties = Joi.object().keys({
        author: Joi.string().allow("").min(1),
        authorEmail: Joi.string().allow("").email(),
        authorURL: Joi.string().allow("").regex(new RegExp(regex.url, "i"), "url"),
        title: Joi.string().required().trim().min(1).max(255),
        slug: Joi.string().required().trim().min(1).max(55).regex(new RegExp(regex.slug), "slug"),
        visible: Joi.string().default("n").valid("y", "n"),
        info: mediumText,
        question: Joi.valid("no"),
        initHTML: mediumText,
        setup: mediumText,
        teardown: mediumText,
        test: Joi.array().min(2).includes(Joi.object().required().keys({
          title: Joi.string().required().trim().min(1).max(255),
          defer: Joi.string().default("n").valid("y", "n"),
          code: Joi.string().required().trim().min(1).max(mediumTextLength)
        }))
      });

      var payload;

      Joi.validate(request.payload, pageProperties, function(er, pageWithTests) {
        if (er) {
          var errObj = {};
          // `abortEarly` option defaults to `true` so can rely on 0 index
          // but just in case...
          try {
            var valErr = er.details[0];

            switch(valErr.path) {
              case "title":
                errObj.titleError = "You must enter a title for this test case.";
                break;
              case "question":
                errObj.spamError = "Please enter ‘no’ to prove you’re not a spammer.";
                break;
              case "slug":
                errObj.slugError = "The slug can only contain alphanumeric characters and hyphens.";
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
                    throw new Error("unknown validation error");
                }
            }
          } catch (ex) {
            errObj.genError = "Please review required fields and save again.";
          }

          errResp(errObj);
        } else {
          // Joi defaults any properties not present in `request.payload` so use `payload` from here on out
          payload = pageWithTests;

          pagesService.checkIfSlugAvailable(server, payload.slug, function(err, isAvail) {
            if (err) {
              errResp(err);
            } else if (!isAvail) {
              errResp({
                slugError: "This slug is already in use. Please choose another one."
              });
            } else {
              pagesService.create(payload, function(errr) {
                if (errr) {
                  errResp(errr);
                } else {
                  reply.redirect("/" + payload.slug);
                }
              });
            }
          });
        }
      });
    }
  });

  return next();

};

exports.register.attributes = {
  name: "web/home"
};
