# jsperf.com

[![Build Status](https://travis-ci.org/jsperf/jsperf.com.svg?branch=master)](https://travis-ci.org/jsperf/jsperf.com) [![Test Coverage](https://codeclimate.com/github/jsperf/jsperf.com/badges/coverage.svg)](https://codeclimate.com/github/jsperf/jsperf.com) [![Code Climate](https://codeclimate.com/github/jsperf/jsperf.com/badges/gpa.svg)](https://codeclimate.com/github/jsperf/jsperf.com)

[Chat on `irc.freenode.net` in the `#jsperf` channel](https://webchat.freenode.net/?channels=jsperf).

## How to run a local copy of jsPerf

### Prerequisites

1. [Node.js](https://nodejs.org/en/) (see preferred version in [`.nvmrc`](https://github.com/jsperf/jsperf.com/blob/master/.nvmrc))
2. [MySQL](https://dev.mysql.com/downloads/mysql/)
  1. Install
    1. macOS: `brew install mysql`
  2. Initialize: `mysql -uroot -e "CREATE DATABASE jsperf; GRANT ALL ON jsperf.* TO 'jsuser'@'localhost' IDENTIFIED BY 'jspass'; FLUSH PRIVILEGES;"`
3. Get a [Browserscope.org](http://www.browserscope.org/) API key by signing in and going to [the settings page](http://www.browserscope.org/user/settings).
4. Register a [new OAuth GitHub application](https://github.com/settings/applications/new). Leave the callback URL blank. Copy the "Client ID" and "Client Secret".

### Setup

1. Install dependencies: `npm install`
2. Create a `.env` file (will be ignored by git) with the following variables (`VAR_NAME=value`):

```
NODE_ENV=development
# from Prerequisites step 2.2
MYSQL_USER=jsuser
MYSQL_PASSWORD=jspass
MYSQL_DATABASE=jsperf
# from Prerequisites step 3
BROWSERSCOPE=
# from Prerequisites step 4
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK=http://localhost:3000

BELL_COOKIE_PASS=password-should-be-32-characters
COOKIE_PASS=password-should-be-32-characters

# customizable but not recommended for local development
# SCHEME=http
# DOMAIN=localhost
# PORT=3000
# MYSQL_HOST=localhost
# MYSQL_PORT=3306
# LOGGLY_TOKEN=
# LOGGLY_SUBDOMAIN=
```

Lastly, create the necessary tables:

```
node setup/tables.js
```

### Start

- [x] correct version of `node`
- [x] `mysql` running
- [x] `.env` created with your values

```
npm start
```

## Contributing

### Building the client

If you make any changes inside [`client/`](https://github.com/jsperf/jsperf.com/tree/master/client), then you'll need to manually re-build the final asset.

```
npm run build
```

### Testing

We use [lab](https://github.com/hapijs/lab) as our test utility and [code](https://github.com/hapijs/code) as our assertion library. Lab lints with [eslint](http://eslint.org/) using the [semistandard style](https://github.com/Flet/semistandard). 100% code coverage by unit tests is required. To run the test suite:

```
npm test
```

_If you want to only lint and save a little time, use `npm run lint` which skips the tests._

_If you are missing code coverage, open `coverage.html` in the root of the project for a detailed visual report._

### Adding new dependencies

1. Install using `npm` and either `--save` or `--save-dev`. **Do not edit `package.json` manually.**
2. Run `npm shrinkwrap --dev` to update `npm-shrinkwrap.json`

If you get an error while shrinkwrapping, try pruning your `node_modules` directory by running `npm prune`. If that doesn't work, try removing what you have installed currently, reinstalling based on `package.json` instead of `npm-shrinkwrap.json`, and then shrinkwrap again.

```
rm -r node_modules/ && npm install --no-shrinkwrap && npm shrinkwrap --dev
```

#### Greenkeeper

Greenkeeper [is working on updating `npm-shrinkwrap.json`](https://github.com/greenkeeperio/greenkeeper/issues/96). In the meantime, here is how **@maxbeatty** has been shrinkwrapping the updates:

1. Get remote branch `git pull origin`
2. Checkout branch locally `git co greenkeeper-<package>-0.0.0`
3. Install updated dependency defined in `package.json` instead of `npm-shrinkwrap.json` `npm i --no-shrinkwrap`
4. Remove anything you no longer need `npm prune`
5. Shrinkwrap the updated dependency `npm shrinkwrap --dev`
6. Commit `git commit -am 'shrinkwrap updated dependency'`
7. Push so updated dependency is tested and Pull Request can be merged `git push origin greenkeeper-<package>-0.0.0`
