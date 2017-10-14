# Contributing to jsPerf

Submit a pull request to `master` with passing tests (`npm test`) and properly [styled](https://github.com/Flet/semistandard) code. [Rebase](https://git-scm.com/docs/git-rebase) as needed.

During development it may be helpful to automatically restart the server when you make changes.

```
npm run watch
```

## Building the client

If you make any changes inside [`client/`](https://github.com/jsperf/jsperf.com/tree/master/client), then you'll need to manually re-build the final asset.

```
npm run build
```

## Testing

We use [lab](https://github.com/hapijs/lab) as our test utility and [code](https://github.com/hapijs/code) as our assertion library. Lab lints with [eslint](http://eslint.org/) using the [semistandard style](https://github.com/Flet/semistandard). 100% code coverage by unit tests is required. To run the test suite:

```
npm test
```

_If you want to only lint and save a little time, use `npm run lint` which skips the tests._

_If you are missing code coverage, open `coverage.html` in the root of the project for a detailed visual report._

### End-to-end (e2e)

End-to-end testing is done by [Selenium Webdriver](https://www.npmjs.com/package/selenium-webdriver). [SauceLabs](https://saucelabs.com) provides Selenium infrastructure for CI. To run tests locally, you'll need [Chrome](https://www.google.com/chrome) and [webdriver-manager](https://www.npmjs.com/package/webdriver-manager).

```
npm i -g webdriver-manager

webdriver-manager update
```

In one terminal, have jsPerf running (`npm start`). In another, have webdriver-manager running (`webdriver-manager start`). And in yet another, run the tests:

```
SELENIUM_SERVER=http://127.0.0.1:4444/wd/hub npm run test-e2e
```

### Known Globals

Lab detects global variable leaks. Sometimes downstream dependencies make this unavoidable so we ignore specific variables in the `lab` command for `npm test` (`package.json#scripts.test`). Here are the known globals with explanations:

- `__core-js_shared__` stems from `core-js`?
- `__grim__` stems from `grim`, a dependency of `marky-markdown` (`npm ls grim`)

## Adding new dependencies

Install using `npm` and either `--save` or `--save-dev`. **Do not edit `package.json` manually.**
