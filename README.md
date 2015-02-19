# jsperf.com

[![Build Status](https://travis-ci.org/jsperf/jsperf.com.svg?branch=master)](https://travis-ci.org/jsperf/jsperf.com) [![Code Climate](https://codeclimate.com/github/jsperf/jsperf.com/badges/gpa.svg)](https://codeclimate.com/github/jsperf/jsperf.com)

## How to run a local copy of jsPerf for testing/debugging

### Prerequisites

You'll need [io.js](https://iojs.org/en/index.html) and [mysql](https://www.mysql.com/downloads/) installed.

1. Clone the repository (`git clone https://github.com/jsperf/jsperf.com.git`)
2. Install dependencies (`npm install`)

### Environment Variables

You'll need to create a `.env` file and provide the following environment variables:

```
PORT=3000

DB_HOST=localhost
DB_USER=jspef
DB_PASS=s3cR3t
DB_NAME=jsperf

DOMAIN=
ASSETS_DOMAIN=
ADMIN_EMAIL=you@example.com

BROWSERSCOPE_API_KEY=s3cR3t
```

### Run

```
npm start
```

## Testing

We use [lab](https://github.com/hapijs/lab) as our test utility and [code](https://github.com/hapijs/code) as our assertion library. Lab enforces linting with [eslint](http://eslint.org/). To run the test suite:

```
make test
```

### Coverage

When [travis-ci](https://travis-ci.org) runs the tests, it enforces 100% code coverage. You can run this locally with either `make test-cov` or `npm test`

#### HTML Report

To generate an HTML report with code coverage, run `make test-cov-html`
