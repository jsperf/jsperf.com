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

### Start

- [x] correct version of `node`
- [x] `mysql` running
- [x] `.env` created with your values

```
npm start
```

## Heroku deploy
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Sponsorship

Development of [jsperf.com](https://jsperf.com) is generously supported by contributions from individuals and corporations. If you are benefiting from jsPerf and would like to help keep the project financially sustainable, please visit [https://jsperf.com/sponsor](https://jsperf.com/sponsor).
