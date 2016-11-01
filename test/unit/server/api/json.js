var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');

var proxyquire = require('proxyquire');
var pagesServiceStub = {};
var JsonPlugin = proxyquire('../../../../server/api/json', {
  '../services/pages': pagesServiceStub
});

var lab = exports.lab = Lab.script();
var request, server;
var expect = Code.expect;

lab.beforeEach(function (done) {
  var plugins = [ JsonPlugin ];
  server = new Hapi.Server();
  server.connection();
  server.register(plugins, done);
});

lab.experiment('json', function () {
  lab.beforeEach(function (done) {
    request = {
      method: 'GET',
      url: '/test/1.json'
    };

    done();
  });

  lab.test('it returns page data', function (done) {
    const data = [
      { // page
        id: 1,
        slug: 'test',
        revision: 1,
        title: 'title',
        info: '',
        setup: '',
        teardown: '',
        published: 'n',
        updated: '',
        maxRev: 1
      }, [ // tests
        {
          testID: 1,
          title: 'Test',
          code: 'Test',
          defer: 'n'
        }
      ], [ // revisions
        {
          author: '',
          revision: 1,
          published: '',
          updated: '',
          maxRev: 1,
          title: 'title'
        }
      ], [ // comments
        {
          id: 1,
          author: '',
          published: '',
          content: ''
        }
      ]
    ];
    pagesServiceStub.getBySlug = function (cnt) {
      return Promise.resolve(data);
    };
    server.inject(request, function (response) {
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      expect(response.result.page).to.equal(data[0]);
      expect(response.result.tests).to.equal(data[1]);
      expect(response.result.revisions).to.equal(data[2]);
      expect(response.result.comments).to.equal(data[3]);
      done();
    });
  });

  lab.test('it returns errors', function (done) {
    pagesServiceStub.getBySlug = function (cnt) {
      return Promise.reject(new Error('DB is down'));
    };
    server.inject(request, function (response) {
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      expect(response.result.statusCode).to.equal(500);
      expect(response.result.error).to.equal('Internal Server Error');
      expect(response.result.message).to.equal('An internal server error occurred');
      done();
    });
  });
});
