const path = require('path');
const Lab = require('lab');
const sinon = require('sinon');
const Code = require('code');
const Hapi = require('hapi');
const proxyquire = require('proxyquire');
const cheerio = require('cheerio');

const Config = require('../../../../../config');

var pagesServiceStub = {
  updateHits: function () {},
  getBySlug: function () {},
  getVisibleBySlugWithRevisions: () => {},
  publish: function () {}
};
var debugSpy = sinon.spy();

var TestPlugin = proxyquire('../../../../../server/web/test/index', {
  '../../services/pages': pagesServiceStub,
  'debug': function () { return debugSpy; }
});

var YarPlugin = {
  register: require('yar'),
  options: { cookieOptions: { password: 'testing' } }
};

var AuthPlugin = {
  register: require('hapi-auth-cookie'),
  options: {}
};

var lab = exports.lab = Lab.script();
var request, server;

lab.beforeEach(function (done) {
  var plugins = [ TestPlugin, YarPlugin ];
  server = new Hapi.Server();

  server.connection({
    port: Config.get('/port/web')
  });

  server.views({
    engines: {
      hbs: require('handlebars')
    },
    path: './server/web',
    layout: true,
    relativeTo: path.join(__dirname, '..', '..', '..', '..', '..')
  });

  server.register(plugins, done);
});

const slug = 'oh-yea';

lab.experiment('test', function () {
  lab.beforeEach(function (done) {
    server.register([ AuthPlugin ], function () {
      server.auth.strategy('session', 'cookie', {
        password: 'testing',
        cookie: 'sid-jsperf',
        redirectTo: false,
        isSecure: false
      });
    });

    request = {
      method: 'GET',
      url: '/' + slug
    };

    pagesServiceStub.getBySlug = sinon.stub();
    pagesServiceStub.updateHits = sinon.stub().returns(Promise.resolve());

    done();
  });

  lab.test('not found', function (done) {
    pagesServiceStub.getBySlug.returns(Promise.reject(new Error('Not found')));

    // adding revision to url here covers true case of rev ternary
    request.url += '/999';

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(404);

      done();
    });
  });

  lab.test('fail to get by slug', function (done) {
    pagesServiceStub.getBySlug.returns(Promise.reject(new Error('real helpful')));

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });

  lab.test('it responds with test page for slug', function (done) {
    const now = new Date();
    const page = {
      id: 1,
      slug: slug,
      revision: 1,
      browserscopeID: 'abc123',
      title: 'Oh Yea',
      info: 'Sample test',
      setup: '',
      teardown: '',
      initHTML: '',
      visible: 'y',
      author: 'Max',
      authorEmail: 'm@b.co',
      authorURL: 'b.co',
      hits: 0,
      published: now,
      updated: now,
      maxRev: 2
    };
    const revisions = [{
      published: now,
      updated: now,
      author: 'Max',
      authorEmail: 'm@b.co',
      authorURL: 'b.co',
      revision: 1,
      visible: 'y',
      title: 'Oh Yea'
    }, {
      published: now,
      updated: now,
      author: 'Max',
      authorEmail: 'm@b.co',
      authorURL: 'b.co',
      revision: 2,
      visible: 'y',
      title: 'Oh Yea'
    }];

    pagesServiceStub.getBySlug.returns(Promise.resolve([page, [], revisions, []]));

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      const $ = cheerio.load(response.payload);
      Code.expect($('title').text()).to.equal('Oh Yea · jsPerf');

      // make sure revision list is correct
      const revLis = $('li', '#revisions');
      const firstRevLi = revLis.first();
      Code.expect(firstRevLi.hasClass('current')).to.be.true();
      Code.expect(firstRevLi.children('a').first().attr('href')).to.equal(request.url);

      const secondRevLi = revLis.eq(1);
      Code.expect(secondRevLi.hasClass('current')).to.be.false();
      Code.expect(secondRevLi.children('a').first().attr('href')).to.equal(request.url + '/' + revisions[1].revision);

      done();
    });
  });

  lab.test('it responds with highlighted test page for slug', function (done) {
    const now = new Date();

    pagesServiceStub.getBySlug.returns(Promise.resolve([{
      id: 1,
      slug: slug,
      revision: 1,
      browserscopeID: 'abc123',
      title: 'Oh Yea',
      info: 'Sample test',
      setup: 'var a = 1',
      teardown: 'delete a',
      initHTML: "<div class='test'><script>var b = 2;</script></div>",
      visible: 'n',
      author: 'Max',
      authorEmail: 'm@b.co',
      authorURL: 'b.co',
      hits: 0,
      published: now,
      updated: now
    }, [], [], []]));

    server.inject(request, function (response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.include('<pre><code class="js"><span class="pretty">  delete a</span></code></pre>');

      done();
    });
  });

  lab.experiment('Page Hits', function () {
    lab.beforeEach(function (done) {
      // Add a method of adding session data
      server.route({
        method: 'GET', path: '/setsession',
        config: {
          handler: function (req, reply) {
            var hits = {123: true};
            req.session.set('hits', hits);
            return reply('session set');
          }
        }
      });

      done();
    });

    lab.test('updates unique page hits', function (done) {
      const now = new Date();
      pagesServiceStub.getBySlug.returns(Promise.resolve([{
        id: 1,
        slug: slug,
        revision: 1,
        browserscopeID: 'abc123',
        title: 'Oh Yea',
        info: 'Sample test',
        setup: 'var a = 1',
        teardown: 'delete a',
        initHTML: "<div class='test'><script>var b = 2;</script></div>",
        visible: 'n',
        author: 'Max',
        authorEmail: 'm@b.co',
        authorURL: 'b.co',
        hits: 0,
        published: now,
        updated: now
      }, [], [], []]));

      pagesServiceStub.updateHits.returns(Promise.resolve());

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie'];
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
        request.headers = {};
        request.headers.cookie = 'session=' + cookie[1];
        server.inject(request, function (response) {
          var hits = response.request.session.get('hits');
          Code.expect(hits[1]).to.equal(true);

          done();
        });
      });
    });

    lab.test('ignores duplicate page hits', function (done) {
      const now = new Date();
      pagesServiceStub.getBySlug.returns(Promise.resolve([{
        id: 123,
        slug: slug,
        revision: 1,
        browserscopeID: 'abc123',
        title: 'Oh Yea',
        info: 'Sample test',
        setup: '',
        teardown: '',
        initHTML: '',
        visible: 'y',
        author: 'Max',
        authorEmail: 'm@b.co',
        authorURL: 'b.co',
        hits: 0,
        published: now,
        updated: now
      }, [], [], []]));

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie'];
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
        request.headers = {};
        request.headers.cookie = 'session=' + cookie[1];
        server.inject(request, function (response) {
          var hits = response.request.session.get('hits');
          Code.expect(hits[123]).to.equal(true);

          done();
        });
      });
    });

    lab.test('catches errors from page service', function (done) {
      const now = new Date();
      pagesServiceStub.getBySlug.returns(Promise.resolve([{
        id: 999,
        slug: slug,
        revision: 1,
        browserscopeID: 'abc123',
        title: 'Oh Yea',
        info: 'Sample test',
        setup: '',
        teardown: '',
        initHTML: '',
        visible: 'y',
        author: 'Max',
        authorEmail: 'm@b.co',
        authorURL: 'b.co',
        hits: 0,
        published: now,
        updated: now
      }, [], [], []]));

      const expectedError = new Error('TODO');
      pagesServiceStub.updateHits.returns(Promise.reject(expectedError));

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie'];
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
        request.headers = {};
        request.headers.cookie = 'session=' + cookie[1];
        server.inject(request, function () {
          const debugCall = debugSpy.getCall(0).args[0];

          Code.expect(debugCall.message).to.equal(expectedError.message);

          done();
        });
      });
    });
  });

  lab.experiment('No Index Flag', function () {
    lab.beforeEach(function (done) {
      const now = new Date();
      pagesServiceStub.getBySlug.returns(Promise.resolve([{
        id: 1,
        slug: slug,
        revision: 1,
        browserscopeID: 'abc123',
        title: 'Oh Yea',
        info: 'Sample test',
        setup: '',
        teardown: '',
        initHTML: '',
        visible: 'n',
        author: 'Max',
        authorEmail: 'm@b.co',
        authorURL: 'b.co',
        hits: 0,
        published: now,
        updated: now
      }, [], [], []]));

      done();
    });

    lab.test('sets noIndex to true if page is flaged as "owned" in the session', function (done) {
      server.route({
        method: 'GET', path: '/setsession',
        config: {
          handler: function (req, reply) {
            var owns = {1: true};
            req.session.set('own', owns);
            return reply('session set');
          }
        }
      });
      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie'];
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
        request.headers = {};
        request.headers.cookie = 'session=' + cookie[1];
        server.inject(request, function (response) {
          Code.expect(response.payload.indexOf('Not published yet!')).to.be.at.least(0);

          done();
        });
      });
    });

    lab.test('sets noIndex to true if page is being viewed by an admin', function (done) {
      server.route({
        method: 'GET', path: '/setsession',
        config: {
          handler: function (req, reply) {
            var owns = {2: true};
            req.session.set('own', owns);
            req.session.set('admin', true);
            return reply('session set');
          }
        }
      });

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie'];
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
        request.headers = {};
        request.headers.cookie = 'session=' + cookie[1];
        server.inject(request, function (response) {
          Code.expect(response.payload.indexOf('Not published yet!')).to.be.at.least(0);

          done();
        });
      });
    });
  });

  lab.experiment('publish', () => {
    lab.beforeEach((done) => {
      request.url = `/${slug}/1/publish`;

      done();
    });

    lab.test('handle error', (done) => {
      pagesServiceStub.getBySlug.returns(Promise.reject(new Error('testing')));

      server.inject(request, (res) => {
        Code.expect(res.statusCode).to.equal(500);

        done();
      });
    });

    lab.test('404 when not owner or admin', (done) => {
      pagesServiceStub.getBySlug.returns(Promise.resolve([{}]));

      server.inject(request, (res) => {
        Code.expect(res.statusCode).to.equal(404);

        done();
      });
    });

    lab.test('makes page visible', (done) => {
      pagesServiceStub.getBySlug.returns(Promise.resolve([{
        id: 1
      }]));

      server.route({
        method: 'GET', path: '/setsession',
        config: {
          handler: function (req, reply) {
            var owns = {1: true};
            req.session.set('own', owns);
            return reply('session set');
          }
        }
      });

      server.inject('/setsession', function (res) {
        var header = res.headers['set-cookie'];
        var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/); // eslint-disable-line no-control-regex, no-useless-escape
        request.headers = {};
        request.headers.cookie = 'session=' + cookie[1];

        server.inject(request, (res) => {
          Code.expect(res.statusCode).to.equal(302);

          done();
        });
      });
    });
  });
});

lab.experiment('atom', () => {
  lab.beforeEach(done => {
    request = {
      method: 'GET',
      url: '/my-test.atom'
    };

    pagesServiceStub.getVisibleBySlugWithRevisions = sinon.stub();

    done();
  });

  lab.test('not found', done => {
    pagesServiceStub.getVisibleBySlugWithRevisions.returns(Promise.reject(new Error('Not found')));

    server.inject(request, response => {
      Code.expect(response.statusCode).to.equal(404);
      done();
    });
  });

  lab.test('it responds with atom feed', done => {
    pagesServiceStub.getVisibleBySlugWithRevisions = slug => {
      var d = new Date();
      return Promise.resolve([
        {
          published: d
        },
        [
          {
            published: d,
            updated: d
          }
        ]
      ]);
    };

    server.inject(request, response => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.headers['content-type']).to.equal('application/atom+xml;charset=UTF-8');
      Code.expect(response.result).to.be.string().and.to.startWith('<feed').and.to.contain('<entry>');

      done();
    });
  });

  lab.test('it responds with generic error', done => {
    pagesServiceStub.getVisibleBySlugWithRevisions = cnt => Promise.reject(new Error());

    server.inject(request, response => {
      Code.expect(response.statusCode).to.equal(500);

      done();
    });
  });
});
