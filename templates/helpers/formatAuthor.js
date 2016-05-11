var Handlebars = require('handlebars');

module.exports = function (name, url, isComment) {
  name = Handlebars.Utils.escapeExpression(name);
  url = Handlebars.Utils.escapeExpression(url);

  var str = '';

  if (name !== '') {
    if (isComment === undefined) {
      isComment = false;
    }

    if (!isComment) {
      str += 'by ';
    }

    if (url && url !== '') {
      str += "<a href='" + url + "'";
      str += url === 'https://mathiasbynens.be/' ? '' : " rel='nofollow'";
      str += '>' + name + '</a>';
    } else {
      str += name + ' ';
    }
  }

  return new Handlebars.SafeString(str);
};
