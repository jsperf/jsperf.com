# jsperf.com

[![Build Status](https://travis-ci.org/jsperf/jsperf.com.svg?branch=master)](https://travis-ci.org/jsperf/jsperf.com) [![Test Coverage](https://codeclimate.com/github/jsperf/jsperf.com/badges/coverage.svg)](https://codeclimate.com/github/jsperf/jsperf.com) [![Code Climate](https://codeclimate.com/github/jsperf/jsperf.com/badges/gpa.svg)](https://codeclimate.com/github/jsperf/jsperf.com)

[Chat on `irc.freenode.net` in the `#jsperf` channel](https://webchat.freenode.net/?channels=jsperf).

## How to run a local copy of jsPerf for testing/debugging

### Prerequisites

1. Clone the repository: `git clone https://github.com/jsperf/jsperf.com.git`
2. Use the version of `node` for this project defined in `.nvmrc`: `nvm install` ([More on `nvm`](https://github.com/creationix/nvm))
2. Install dependencies: `npm install`
3. Get a [Browserscope.org](http://www.browserscope.org/) API key by signing in and going to [the settings page](http://www.browserscope.org/user/settings). (You'll need this in the last step)
4. Register a new OAuth GitHub development application by going to [your settings page in github](https://github.com/settings/applications/new). Take note to copy the "Client ID" and "Client Secret". The callback URL is simply the root url of the application, e.g., `http://localhost:3000`
5. Setup environment configuration: `node setup`

##### Setup

You’ll need [Node.js](https://nodejs.org/en/) and [MySQL](https://dev.mysql.com/downloads/mysql/) installed.

Start the MySQL server, create a database, a user, and create the database-tables using the `tables.js` file. Replace with your own credentials.

```
DB_ENV_MYSQL_PASSWORD=password DB_ENV_MYSQL_DATABASE=jsperf DB_ENV_MYSQL_USER=jsperf node setup/tables.js
```

Add an entry to the hosts file to redirect jsPerf’s database connections to `localhost` (which is where MySQL is likely running) with the following:

```
127.0.0.1 db
```

##### Running jsPerf

```
DB_ENV_MYSQL_PASSWORD=password DB_ENV_MYSQL_DATABASE=jsperf DB_ENV_MYSQL_USER=jsperf npm start
```

### Building the client

```
npm run build
```

## Testing

We use [lab](https://github.com/hapijs/lab) as our test utility and [code](https://github.com/hapijs/code) as our assertion library. Lab lints with [eslint](http://eslint.org/) using the [semistandard style](https://github.com/Flet/semistandard). 100% code coverage by unit tests is required. To run the test suite:

```
# everything
npm test

# directory
npm test -- test/unit/server/web

# file
npm test -- test/unit/server/web/contributors/index.js
```

_If you want to only lint and save a little time, use `npm run lint` which skips the tests._

_If you are missing code coverage, open `coverage.html` in the root of the project for a detailed visual report._

## Gotchas

- ES6 Template Strings are not supported by esprima which means you can't generate coverage reports which means `npm test` won't pass.

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

## Debugging

If you'd like extra debugging information when running the server, run with the `DEBUG` environment variable set to `*` for everything including dependencies or `jsperf*` for only this project's debugging statements.

```bash
DEBUG=jsperf* npm start
```

To add more debugging, require [the `debug` module](https://www.npmjs.com/package/debug) and namespace according to the path to the file. For example, if you want to add debugging information in `server/web/errors`, the debug name would be `jsperf:web:errors`. This allows you to finely tune which debug statements you turn on.

To only turn on `web` debug statements and not `services`:

```bash
DEBUG=jsperf:web* npm start
```
