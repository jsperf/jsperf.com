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
5. Setup environment configuration: `npm run setup`

### Running the server

#### Docker

jsPerf is available at `localhost` and changes to the codebase can be applied by running `docker-compose build web`

##### One-time Setup

1. Install [Docker Toolbox](https://docs.docker.com/engine/installation/) so you have `docker` and `docker-compose`
2. Create a Data Volume Container to persist data: `docker create -v /var/lib/mysql --name data-jsperf-mysql mysql /bin/true`
3. After completing the "Compose" steps below, setup database tables with: `docker-compose run web node /code/setup/tables`

##### Compose

`docker-compose.yml` orchestrates a load balancer (nginx), the app (this node project), and a database (mysql) with some additional services to help with continuous deployment. To start everything up, run: `MYSQL_PASSWORD=$MYSQL_PASSWORD docker-compose up`. Pressing `ctrl+c` or sending a similar interruption will stop all of the containers. To run the composed containers in the background, use the `-d` argument.

You can start additional app containers by running `docker-compose scale web=3` where `3` is the total number of containers. The load balancer will automatically reconfigure itself to include the new containers. Similarly, you can scale down the containers by running `docker-compose scale web=1` and the load balancer will, again, reconfigure itself accordingly.

Once you've built the images with `docker-compose`, you can manually run additional containers similar to how `docker-compose scale` would.

```
docker run -d --name jsperfcom_web_man \
--link jsperfcom_db_1:db \
--env-file .env \
--env SERVICE_3000_CHECK_HTTP=/health \
--env SERVICE_3000_CHECK_INTERVAL=1s \
jsperfcom_web
```

#### Running jsPerf locally

It is also possible to run jsPerf locally without installing and using Docker.
##### Setup
You’ll need [Node.js](https://nodejs.org/en/) and [MySQL](https://dev.mysql.com/downloads/mysql/) installed.

Start the MySQL server, create a database, a user, and create the database-tables using the tables.js-file. Replace with your own credentials.

```
node setup/tables.js DB_ENV_MYSQL_PASSWORD=password DB_ENV_MYSQL_DATABASE=jsperf DB_ENV_MYSQL_USER=jsperf
```

Add an entry to the hosts file to redirect jsPerfs database-connections to localhost(which is where MySQL is likely running) with the following: `127.0.0.1          db`

##### Running jsPerf
```
npm start DB_ENV_MYSQL_PASSWORD=password DB_ENV_MYSQL_DATABASE=jsperf DB_ENV_MYSQL_USER=jsperf
```

## Testing

We use [lab](https://github.com/hapijs/lab) as our test utility and [code](https://github.com/hapijs/code) as our assertion library. Lab lints with [eslint](http://eslint.org/) using the [semistandard style](https://github.com/Flet/semistandard). 100% code coverage by unit tests is required. To run the test suite:

```
# everything
npm test

# directory
npm test -- test/server/web

# file
npm test -- test/server/web/contributors/index.js
```

_If you'd just like to lint and save a little time, you can run `npm run lint` which skips the tests._

_If you're missing code coverage, open `coverage.html` in the root of the project for a detailed visual report._

## Gotchas

- ES6 Template Strings are not supported by esprima which means you can't generate coverage reports which means `npm test` won't pass.

### Adding new dependencies

1. Install using `npm` and either `--save` or `--save-dev`. Do not edit `package.json` manually.
2. Run `npm run shrinkwrap` to update `npm-shrinkwrap.json`

If you get an error while shrinkwrapping, try removing what you have installed currently, reinstalling based on `package.json` instead of `npm-shrinkwrap.json`, and then shrinkwrap again.

```
rm -r node_modules/ && npm install --ignore-shrinkwrap && npm run shrinkwrap
```

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
