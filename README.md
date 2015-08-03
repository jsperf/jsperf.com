# jsperf.com

[![Build Status](https://travis-ci.org/jsperf/jsperf.com.svg?branch=master)](https://travis-ci.org/jsperf/jsperf.com) [![Test Coverage](https://codeclimate.com/github/jsperf/jsperf.com/badges/coverage.svg)](https://codeclimate.com/github/jsperf/jsperf.com) [![Code Climate](https://codeclimate.com/github/jsperf/jsperf.com/badges/gpa.svg)](https://codeclimate.com/github/jsperf/jsperf.com)

[Chat on `irc.freenode.net` in the `#jsperf` channel](https://webchat.freenode.net/?channels=jsperf).

## How to run a local copy of jsPerf for testing/debugging

### Prerequisites

You’ll need [io.js](https://iojs.org/en/index.html) and [MySQL](https://www.mysql.com/downloads/) installed.

1. Clone the repository (`git clone https://github.com/jsperf/jsperf.com.git`).
2. Install dependencies (`npm install`).
3. Get a [Browserscope.org](http://www.browserscope.org/) API key by signing in and going to [the settings page](http://www.browserscope.org/user/settings). (You'll need this in the next step)
4. Register a new OAuth GitHub development application by going to [your settings page in github](https://github.com/settings/applications/new). Take note to copy the "Client ID" and "Client Secret". The callback URL is simply the root url of the application, e.g., "http://localhost:3000"
5. Setup database and other environment configuration (`npm run setup`).

### Running the server

```
npm start
```

## Testing

We use [lab](https://github.com/hapijs/lab) as our test utility and [code](https://github.com/hapijs/code) as our assertion library. Lab enforces linting with [eslint](http://eslint.org/). To run the test suite:

```
# everything
npm run test-lint

# directory
npm run test-lint -- test/server/web

# file
npm run test-lint -- test/server/web/contributors/index.js
```

_If you're in a hurry, use `npm run test-fast` to test but not lint or `npm run lint` to lint but not test_

### Coverage

When [travis-ci](https://travis-ci.org/) runs the tests, it enforces 100% code coverage. You can run this locally with:

```
npm test
```

#### HTML Report

To generate an HTML report with code coverage, run:

```
npm run test-cov-html
```

## Gotchas

- ES6 Template Strings are not supported by esprima which means you can't generate coverage reports which means `npm test` won't pass.

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
