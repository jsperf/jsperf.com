const https = require('https');
const querystring = require('querystring');

exports.register = function (server, options, next) {
  server.expose('addTest', function (title, description, slug) {
    return new Promise(function (resolve, reject) {
      var qs = querystring.stringify({
        'api_key': options.api_key,
        name: title,
        description: description.substr(0, 60),
        url: options.scheme + '://' + options.domain + '/' + slug
      });

      https.get('https://www.browserscope.org/user/tests/create?' + qs, function (res) {
        var str = '';

        res.on('data', function (chunk) {
          str += chunk;
        });

        res.on('end', function () {
          try {
            resolve(JSON.parse(str).test_key);
          } catch (e) {
            server.log('error', e);
            resolve();
          }
        });
      }).on('error', function (e) {
        server.log('error', e);
        resolve();
      });
    });
  });

  return next();
};

exports.register.attributes = {
  name: 'repositories/browserscope'
};
