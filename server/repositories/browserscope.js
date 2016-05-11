// TODO make hapi plugin
var https = require('https');
var querystring = require('querystring');

var config = require('../../config');

module.exports = {
  addTest: function (title, description, slug) {
    return new Promise(function (resolve, reject) {
      var qs = querystring.stringify({
        'api_key': config.get('/browserscope'),
        name: title,
        description: description.substr(0, 60),
        url: config.get('/scheme') + '://' + config.get('/domain') + '/' + slug
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
            reject(new Error('Unexpected response from browserscope.org'));
          }
        });
      }).on('error', reject);
    });
  }
};
