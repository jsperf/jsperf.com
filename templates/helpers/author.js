"use strict";

var Handlebars = require("handlebars");

// http://stackoverflow.com/a/494122/613588
RegExp.quote = function(str) {
  return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
 };

function removeFromBegin(str, remove) {
  let re = new RegExp("^" + RegExp.quote(remove));
  return str.replace(re, "");
}

module.exports = function(name, url, isComment) {
  name = Handlebars.Utils.escapeExpression(name);
  url = Handlebars.Utils.escapeExpression(url);

  var str = "";

  if (name !== "") {
    if (isComment === undefined) {
      isComment = false;
    }

    if (!isComment) {
      str += "by ";
    }

    if (url !== "") {
      str += "<a href=\"" + removeFromBegin(url, "http:") + "\"";
      str += url === "http://mathiasbynens.be/" ? "" : " rel=\"nofollow\"";
      str += ">" + name + "</a>";
    } else {
      str += name + " ";
    }
  }

  return new Handlebars.SafeString(str);
};
