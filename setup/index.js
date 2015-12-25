var fs = require('fs');
var prompt = require('prompt');

var schema = {
  properties: {
    scheme: {
      description: 'Scheme for node server',
      pattern: /^(https?)$/,
      message: 'Must be either "http" or "https"',
      required: true,
      default: 'http'
    },
    domain: {
      description: 'Local domain for node server',
      format: 'host-name',
      required: true,
      default: 'dev.jsperf.com'
    },
    port: {
      description: 'Port for node server',
      message: 'Should be a high port like 3000',
      required: false,
      default: 3000
    },
    admin: {
      properties: {
        email: {
          description: 'Email to send admin things to',
          format: 'email',
          required: false
        }
      }
    },
    browserscope: {
      description: 'Browserscope.org API key',
      message: 'See README for instructions on how to get one',
      required: true
    },
    'bell_cookie': {
      properties: {
        pass: {
          description: 'Cookie Password for Oauth',
          required: true,
          default: ''
        }
      }
    },
    cookie: {
      properties: {
        pass: {
          description: 'Cookie Password',
          required: true,
          default: ''
        }
      }
    },
    'github_client': {
      properties: {
        id: {
          description: 'GitHub Client ID',
          required: true,
          default: ''
        },
        secret: {
          description: 'GitHub Client Secret',
          required: true,
          default: ''
        }
      }
    },
    mysql: {
      properties: {
        password: {
          description: 'Password for the `jsperf` user in the MySQL container',
          required: true,
          default: (~~(Math.random() * (1 << 24))).toString(16)
        }
      }
    }
  }
};

// use existing env vars
require('dotenv').load();

// process.env.DB_HOST => { db: { host: '' } }
// warning: nested prompts not supported yet https://github.com/flatiron/prompt/issues/47
var unbuildVars = function () {
  var overrides = {};
  var prop;

  for (prop in schema.properties) {
    var p = schema.properties[prop];

    if (p.properties) {
      overrides[prop] = {};
      var nestedProp;

      for (nestedProp in p.properties) {
        overrides[prop][nestedProp] = process.env[prop.toUpperCase() + '_' + nestedProp.toUpperCase()];
      }
    } else {
      overrides[prop] = process.env[prop.toUpperCase()];
    }
  }

  return overrides;
};

prompt.override = unbuildVars();

prompt.start();

// { db: { host: 'localhost' } } => DB_HOST=localhost
var buildVars = function (dest, obj, prefix) {
  if (!prefix) {
    prefix = '';
  }

  for (var prop in obj) {
    var k = prop.toUpperCase();
    var v = obj[prop];

    if (v instanceof Object) {
      dest = buildVars(dest, v, k + '_');
    } else {
      dest += prefix + k + '=' + v + '\n';
    }
  }

  return dest;
};

prompt.get(schema, function (er, result) {
  if (er) {
    throw er;
  }

  fs.writeFileSync('.env', buildVars('NODE_ENV=development\n', result));

  console.log('Thanks! You can change these later in the .env file');
});
