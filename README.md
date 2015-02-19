# jsperf.com

[![Build Status](https://travis-ci.org/jsperf/jsperf.com.svg?branch=master)](https://travis-ci.org/jsperf/jsperf.com)

## How to run a local copy of jsPerf for testing/debugging

### Prerequisites

You'll need [io.js](https://iojs.org/en/index.html) and [mysql](https://www.mysql.com/downloads/) installed.

1. Clone the repository (`git clone https://github.com/jsperf/jsperf.com.git`)
2. Install dependencies (`npm install`)

### Environment Variables

You'll need to provide the following environment variables:

- `PORT`

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
