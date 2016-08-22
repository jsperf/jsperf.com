/* global Benchmark localStorage _ */
/*!
 * ui.js
 * Copyright Mathias Bynens <https://mths.be/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <https://mths.be/mit>
 */
(function (window, document) {
  /** Cache of error messages */
  var errors = [];

  /** Google Analytics account id */
  var gaId = '';

  /** Cache of event handlers */
  var handlers = {};

  /** A flag to indicate that the page has loaded */
  var pageLoaded = false;

  /** Benchmark results element id prefix (e.g. `results-1`) */
  var prefix = 'results-';

  /** The element responsible for scrolling the page (assumes ui.js is just before </body>) */
  var scrollEl = document.body;

  /** Used to resolve a value's internal [[Class]] */
  var toString = {}.toString;

  /** Namespace */
  var ui = new Benchmark.Suite();

  /** Object containing various CSS class names */
  var classNames = {
    // used for error styles
    'error': 'error',
    // used to make content visible
    'show': 'show',
    // used to reset result styles
    'results': 'results'
  };

  /** Used to flag environments/features */
  var has = {
    // used for pre-populating form fields
    'localStorage': !!(function () {
      try {
        return !localStorage.getItem(+new Date());
      } catch (e) {}
    })(),
    // used to distinguish between a regular test page and an embedded chart
    'runner': !!$('runner')
  };

  /** Object containing various text messages */
  var texts = {
    // inner text for the various run button states
    'run': {
      'again': 'Run again',
      'ready': 'Run tests',
      'running': 'Stop running'
    },
    // common status values
    'status': {
      'again': 'Done. Ready to run again.',
      'ready': 'Ready to run.'
    }
  };

  /** The options object for Benchmark.Suite#run */
  var runOptions = {
    'async': true,
    'queued': true
  };

  /** API shortcuts */
  var filter = Benchmark.filter;
  var formatNumber = Benchmark.formatNumber;
  var join = Benchmark.join;

  /* ------------------------------------------------------------------------ */

  handlers.benchmark = {

    /**
     * The onCycle callback, used for onStart as well, assigned to new benchmarks.
     *
     * @private
     */
    'cycle': function () {
      var bench = this;
      var size = bench.stats.sample.length;

      if (!bench.aborted) {
        setStatus(bench.name + ' &times; ' + formatNumber(bench.count) + ' (' +
          size + ' sample' + (size === 1 ? '' : 's') + ')');
      }
    },

    /**
     * The onStart callback assigned to new benchmarks.
     *
     * @private
     */
    'start': function () {
      // call user provided init() function
      if (isFunction(window.init)) {
        init(); // eslint-disable-line no-undef
      }
    }
  };

  handlers.button = {

    /**
     * The "run" button click event handler used to run or abort the benchmarks.
     *
     * @private
     */
    'run': function () {
      var stopped = !ui.running;
      ui.abort();
      ui.length = 0;

      if (stopped) {
        logError({ 'clear': true });
        ui.push.apply(ui, _.filter(ui.benchmarks, function (bench) {
          return !bench.error && bench.reset();
        }));
        ui.run(runOptions);
      }
    }
  };

  handlers.title = {

    /**
     * The title table cell click event handler used to run the corresponding benchmark.
     *
     * @private
     * @param {Object} event The event object.
     */
    'click': function (event) {
      event || (event = window.event);

      var id;
      var index;
      var target = event.target || event.srcElement;

      while (target && !(id = target.id)) {
        target = target.parentNode;
      }
      index = id && --id.split('-')[1] || 0;
      ui.push(ui.benchmarks[index].reset());
      ui.running ? ui.render(index) : ui.run(runOptions);
    },

    /**
     * The title cell keyup event handler used to simulate a mouse click when hitting the ENTER key.
     *
     * @private
     * @param {Object} event The event object.
     */
    'keyup': function (event) {
      if ((event || window.event).keyCode === 13) {
        handlers.title.click(event);
      }
    }
  };

  handlers.window = {

    /**
     * The window hashchange event handler supported by Chrome 5+, Firefox 3.6+, and IE8+.
     *
     * @private
     */
    'hashchange': function () {
      ui.parseHash();

      var scrollTop;
      var params = ui.params;
      var chart = params.chart;
      var filterBy = params.filterby;

      if (pageLoaded) {
        // configure browserscope
        ui.browserscope.postable = has.runner && !('nopost' in params);

        // configure chart renderer
        if (chart || filterBy) {
          scrollTop = $('results').offsetTop;
          ui.browserscope.render({ 'chart': chart, 'filterBy': filterBy });
        }
        if (has.runner) {
          // call user provided init() function
          if (isFunction(window.init)) {
            init(); // eslint-disable-line no-undef
          }
          // auto-run
          if ('run' in params) {
            scrollTop = $('runner').offsetTop;
            setTimeout(handlers.button.run, 1);
          }
          // scroll to the relevant section
          if (scrollTop) {
            scrollEl.scrollTop = scrollTop;
          }
        }
      }
    },

    /**
     * The window load event handler used to initialize the UI.
     *
     * @private
     */
    'load': function () {
      // only for pages with a comment form
      if (has.runner) {
        // init the ui
        addClass('controls', classNames.show);
        addListener('run', 'click', handlers.button.run);

        setHTML('run', texts.run.ready);
        setStatus(texts.status.ready);

        // prefill author details
        if (has.localStorage) {
          _.each([$('author'), $('authorEmail'), $('authorUrl')], function (element) {
            element.value = localStorage[element.id] || '';
            element.oninput = element.onkeydown = function (event) {
              event && event.type < 'k' && (element.onkeydown = null);
              localStorage[element.id] = element.value;
            };
          });
        }
        // show warning when Firebug is enabled (avoids showing for Firebug Lite)
        try {
          // Firebug 1.9 no longer has `console.firebug`
          if (console.firebug || /firebug/i.test(console.table())) {
            addClass('firebug', classNames.show);
          }
        } catch (e) {}
      }
      // clear length so tests can be manually queued
      ui.length = 0;

      // evaluate hash values after all other "load" events have fired
      _.defer(function () {
        pageLoaded = true;
        handlers.window.hashchange();
      });
    }
  };

  /* --------------------------------------------------------------------------*/

  /**
   * Shortcut for document.getElementById().
   *
   * @private
   * @param {Element|string} id The id of the element to retrieve.
   * @returns {Element} The element, if found, or null.
   */
  function $ (id) {
    return typeof id === 'string' ? document.getElementById(id) : id;
  }

  /**
   * Adds a CSS class name to an element's className property.
   *
   * @private
   * @param {Element|string} element The element or id of the element.
   * @param {string} className The class name.
   * @returns {Element} The element.
   */
  function addClass (element, className) {
    if ((element = $(element)) && !hasClass(element, className)) {
      element.className += (element.className ? ' ' : '') + className;
    }
    return element;
  }

  /**
   * Registers an event listener on an element.
   *
   * @private
   * @param {Element|string} element The element or id of the element.
   * @param {string} eventName The name of the event.
   * @param {Function} handler The event handler.
   * @returns {Element} The element.
   */
  function addListener (element, eventName, handler) {
    if ((element = $(element))) {
      if (typeof element.addEventListener !== 'undefined') {
        element.addEventListener(eventName, handler, false);
      } else if (typeof element.attachEvent !== 'undefined') {
        element.attachEvent('on' + eventName, handler);
      }
    }
    return element;
  }

  /**
   * Appends to an element's innerHTML property.
   *
   * @private
   * @param {Element|string} element The element or id of the element.
   * @param {string} html The HTML to append.
   * @returns {Element} The element.
   */
  function appendHTML (element, html) {
    if ((element = $(element)) && html != null) {
      element.innerHTML += html;
    }
    return element;
  }

  /**
   * Shortcut for document.createElement().
   *
   * @private
   * @param {string} tag The tag name of the element to create.
   * @returns {Element} A new element of the given tag name.
   */
  function createElement (tagName) {
    return document.createElement(tagName);
  }

  /**
   * Checks if an element is assigned the given class name.
   *
   * @private
   * @param {Element|string} element The element or id of the element.
   * @param {string} className The class name.
   * @returns {boolean} If assigned the class name return true, else false.
   */
  function hasClass (element, className) {
    return !!(element = $(element)) &&
      (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
  }

  /**
   * Set an element's innerHTML property.
   *
   * @private
   * @param {Element|string} element The element or id of the element.
   * @param {string} html The HTML to set.
   * @returns {Element} The element.
   */
  function setHTML (element, html) {
    if ((element = $(element))) {
      element.innerHTML = html == null ? '' : html;
    }
    return element;
  }

  /* --------------------------------------------------------------------------*/

  /**
   * Gets the Hz, i.e. operations per second, of `bench` adjusted for the
   * margin of error.
   *
   * @private
   * @param {Object} bench The benchmark object.
   * @returns {number} Returns the adjusted Hz.
   */
  function getHz (bench) {
    return 1 / (bench.stats.mean + bench.stats.moe);
  }

  /**
   * Checks if a value has an internal [[Class]] of Function.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {boolean} Returns `true` if the value is a function, else `false`.
   */
  function isFunction (value) {
    return toString.call(value) === '[object Function]';
  }

  /**
   * Appends to or clears the error log.
   *
   * @private
   * @param {string|Object} text The text to append or options object.
   */
  function logError (text) {
    var table;
    var div = $('error-info');
    var options = {};

    // juggle arguments
    if (typeof text === 'object' && text) {
      options = text;
      text = options.text;
    } else if (arguments.length) {
      options.text = text;
    }
    if (!div) {
      table = $('test-table');
      div = createElement('div');
      div.id = 'error-info';
      table.parentNode.insertBefore(div, table.nextSibling);
    }
    if (options.clear) {
      div.className = div.innerHTML = '';
      errors.length = 0;
    }
    if ('text' in options && _.indexOf(errors, text) < 0) {
      errors.push(text);
      addClass(div, classNames.show);
      appendHTML(div, text);
    }
  }

  /**
   * Sets the status text.
   *
   * @private
   * @param {string} text The text to write to the status.
   */
  function setStatus (text) {
    setHTML('status', text);
  }

  /* --------------------------------------------------------------------------*/

  /**
   * Parses the window.location.hash value into an object assigned to `ui.params`.
   *
   * @static
   * @memberOf ui
   * @returns {Object} The suite instance.
   */
  function parseHash () {
    var me = this;
    var hashes = window.location.hash.slice(1).split('&');
    var params = me.params || (me.params = {});

    // remove old params
    _.forOwn(params, function (value, key) {
      delete params[key];
    });

    // add new params
    _.each(hashes[0] && hashes, function (value) {
      value = value.split('=');
      params[value[0].toLowerCase()] = (value[1] || '').toLowerCase();
    });
    return me;
  }

  /**
   * Renders the results table cell of the corresponding benchmark(s).
   *
   * @static
   * @memberOf ui
   * @param {number} [index] The index of the benchmark to render.
   * @returns {Object} The suite instance.
   */
  function render (index) {
    _.each(index == null ? (index = 0, ui.benchmarks) : [ui.benchmarks[index]], function (bench) {
      var parsed;
      var cell = $(prefix + (++index));
      var error = bench.error;
      var hz = bench.hz;

      // reset title and class
      cell.title = '';
      cell.className = classNames.results;

      // status: error
      if (error) {
        setHTML(cell, 'Error');
        addClass(cell, classNames.error);
        parsed = join(error, '</li><li>');
        logError('<p>' + error + '.</p>' + (parsed ? '<ul><li>' + parsed + '</li></ul>' : ''));
      } else {
        // status: running
        if (bench.running) {
          setHTML(cell, 'running&hellip;');
        } else if (bench.cycles) { // status: completed
          // obscure details until the suite has completed
          if (ui.running) {
            setHTML(cell, 'completed');
          } else {
            cell.title = 'Ran ' + formatNumber(bench.count) + ' times in ' +
              bench.times.cycle.toFixed(3) + ' seconds.';
            setHTML(cell, formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) +
              ' <small>&plusmn;' + bench.stats.rme.toFixed(2) + '%</small>');
          }
        } else {
          // status: pending
          if (ui.running && ui.indexOf(bench) > -1) {
            setHTML(cell, 'pending&hellip;');
          } else { // status: ready
            setHTML(cell, 'ready');
          }
        }
      }
    });
    return ui;
  }

  /* --------------------------------------------------------------------------*/

  ui.on('add', function (event) {
    var bench = event.target;
    var index = ui.benchmarks.length;
    var id = index + 1;
    var title = $('title-' + id);

    ui.benchmarks.push(bench);

    if (has.runner) {
      title.tabIndex = 0;
      title.title = 'Click to run this test again.';

      addListener(title, 'click', handlers.title.click);
      addListener(title, 'keyup', handlers.title.keyup);

      bench.on('start', handlers.benchmark.start);
      bench.on('start cycle', handlers.benchmark.cycle);
      ui.render(index);
    }
  })
  .on('start cycle', function () {
    ui.render();
    setHTML('run', texts.run.running);
  })
  .on('complete', function () {
    var benches = filter(ui.benchmarks, 'successful');
    var fastest = filter(benches, 'fastest');
    var slowest = filter(benches, 'slowest');

    ui.render();
    setHTML('run', texts.run.again);
    setStatus(texts.status.again);

    // highlight result cells
    _.each(benches, function (bench) {
      var cell = $(prefix + (_.indexOf(ui.benchmarks, bench) + 1));
      var fastestHz = getHz(fastest[0]);
      var hz = getHz(bench);
      var percent = (1 - (hz / fastestHz)) * 100;
      var span = cell.getElementsByTagName('span')[0];
      var text = 'fastest';

      if (_.indexOf(fastest, bench) > -1) {
        // mark fastest
        addClass(cell, text);
      } else {
        text = isFinite(hz)
          ? formatNumber(percent < 1 ? percent.toFixed(2) : Math.round(percent)) + '% slower'
          : '';

        // mark slowest
        if (_.indexOf(slowest, bench) > -1) {
          addClass(cell, 'slowest');
        }
      }
      // write ranking
      if (span) {
        setHTML(span, text);
      } else {
        appendHTML(cell, '<span>' + text + '</span>');
      }
    });

    ui.browserscope.post();
  });

  /* --------------------------------------------------------------------------*/

  /**
   * An array of benchmarks created from test cases.
   *
   * @memberOf ui
   * @type Array
   */
  ui.benchmarks = [];

  /**
   * The parsed query parameters of the pages url hash.
   *
   * @memberOf ui
   * @type Object
   */
  ui.params = {};

  // parse query params into ui.params hash
  ui.parseHash = parseHash;

  // (re)render the results of one or more benchmarks
  ui.render = render;

  /* --------------------------------------------------------------------------*/

  // expose
  window.ui = ui;

  // don't let users alert, confirm, prompt, or open new windows
  window.alert = window.confirm = window.prompt = window.open = function () {};

  // parse hash query params when it changes
  addListener(window, 'hashchange', handlers.window.hashchange);

  // bootstrap onload
  addListener(window, 'load', handlers.window.load);

  // parse location hash string
  ui.parseHash();

  // provide a simple UI for toggling between chart types and filtering results
  // (assumes ui.js is just before </body>)
  (function () {
    var sibling = $('bs-results');
    var p = createElement('p');

    p.innerHTML =
      '<span id=charts><strong>Chart type:</strong> <a href=#>bar</a>, ' +
      '<a href=#>column</a>, <a href=#>line</a>, <a href=#>pie</a>, ' +
      '<a href=#>table</a></span><br>' +
      '<span id=filters><strong>Filter:</strong> <a href=#>popular</a>, ' +
      '<a href=#>all</a>, <a href=#>desktop</a>, <a href=#>family</a>, ' +
      '<a href=#>major</a>, <a href=#>minor</a>, <a href=#>mobile</a>, ' +
      '<a href=#>prerelease</a></span>';

    sibling.parentNode.insertBefore(p, sibling);

    // use DOM0 event handler to simplify canceling the default action
    $('charts').onclick =
    $('filters').onclick = function (event) {
      event || (event = window.event);
      var target = event.target || event.srcElement;
      if (target.href || (target = target.parentNode).href) {
        ui.browserscope.render(
          target.parentNode.id === 'charts'
            ? { 'chart': target.innerHTML }
            : { 'filterBy': target.innerHTML }
        );
      }
      // cancel the default action
      return false;
    };
  }());

  /* --------------------------------------------------------------------------*/

  // fork for runner or embedded chart
  if (has.runner) {
    // detect the scroll element
    (function () {
      var scrollTop;
      var div = document.createElement('div');
      var body = document.body;
      var bodyStyle = body.style;
      var bodyHeight = bodyStyle.height;
      var html = document.documentElement;
      var htmlStyle = html.style;
      var htmlHeight = htmlStyle.height;

      bodyStyle.height = htmlStyle.height = 'auto';
      div.style.cssText = 'display:block;height:9001px;';
      body.insertBefore(div, body.firstChild);
      scrollTop = html.scrollTop;

      // set `scrollEl` that's used in `handlers.window.hashchange()`
      if (html.clientWidth !== 0 && ++html.scrollTop && html.scrollTop === scrollTop + 1) {
        scrollEl = html;
      }
      body.removeChild(div);
      bodyStyle.height = bodyHeight;
      htmlStyle.height = htmlHeight;
      html.scrollTop = scrollTop;
    }());

    // catch and display errors from the "preparation code"
    window.onerror = function (message, fileName, lineNumber) {
      logError('<p>' + message + '.</p><ul><li>' + join({
        'message': message,
        'fileName': fileName,
        'lineNumber': lineNumber
      }, '</li><li>') + '</li></ul>');
      scrollEl.scrollTop = $('error-info').offsetTop;
    };
  } else {
    // short circuit unusable methods
    ui.render = function () {};
    ui.off('start cycle complete');
    setTimeout(function () {
      ui.off();
      ui.browserscope.post = function () {};
      _.invokeMap(ui.benchmarks, 'off');
    }, 1);
  }

  /* --------------------------------------------------------------------------*/

  // optimized asynchronous Google Analytics snippet based on
  // https://mathiasbynens.be/notes/async-analytics-snippet
  if (gaId) {
    (function () {
      var script = createElement('script');
      var sibling = document.getElementsByTagName('script')[0];

      window._gaq = [['_setAccount', gaId], ['_trackPageview']];
      script.src = 'https://www.google-analytics.com/ga.js';
      sibling.parentNode.insertBefore(script, sibling);
    }());
  }
}(this, document));
