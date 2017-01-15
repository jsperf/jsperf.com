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

```bash
npm i -g webdriver-manager

webdriver-manager update
```

In one terminal, have jsPerf running (`npm start`). In another, have webdriver-manager running (`webdriver-manager start`). And in yet another, run the tests:

```bash
npm run test-e2e
```

## Adding new dependencies

1. Install using `npm` and either `--save` or `--save-dev`. **Do not edit `package.json` manually.**
2. Run `npm shrinkwrap --dev` to update `npm-shrinkwrap.json`

If you get an error while shrinkwrapping, try pruning your `node_modules` directory by running `npm prune`. If that doesn't work, try removing what you have installed currently, reinstalling based on `package.json` instead of `npm-shrinkwrap.json`, and then shrinkwrap again.

```
rm -r node_modules/ && npm install --no-shrinkwrap && npm shrinkwrap --dev
```

### Greenkeeper

Greenkeeper [is working on updating `npm-shrinkwrap.json`](https://github.com/greenkeeperio/greenkeeper/issues/96). In the meantime, here is how [**@maxbeatty**](https://github.com/maxbeatty) has been shrinkwrapping the updates:

1. Get remote branch `git pull origin`
2. Checkout branch locally `git co greenkeeper-<package>-0.0.0`
3. Install updated dependency defined in `package.json` instead of `npm-shrinkwrap.json` `npm i --no-shrinkwrap`
4. Remove anything you no longer need `npm prune`
5. Shrinkwrap the updated dependency `npm shrinkwrap --dev`
6. Commit `git commit -am 'shrinkwrap updated dependency'`
7. Push so updated dependency is tested and Pull Request can be merged `git push origin greenkeeper-<package>-0.0.0`
