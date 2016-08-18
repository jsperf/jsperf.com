var Lab = require('lab');
var Code = require('code');
var sinon = require('sinon');

var compare = require('../../../../templates/helpers/compare');

var lab = exports.lab = Lab.script();

lab.experiment('Template Helper compare', function () {
  lab.test('throws error if unsupported operator', function (done) {
    try {
      compare(1, 2, { hash: { operator: '!' } });
    } catch (e) {
      Code.expect(e.message).to.include('Unsupported operator');
    }

    done();
  });

  lab.test('calls options fn if operator evaluates true', function (done) {
    var fnStub = sinon.stub();

    compare(2, 2, {
      hash: { operator: '===' },
      fn: fnStub
    });

    Code.expect(fnStub.called).to.be.true();

    done();
  });

  lab.test('calls options inverse if operator evaluates false', function (done) {
    var inStub = sinon.stub();

    compare(2, 1, {
      hash: { operator: '===' },
      inverse: inStub
    });

    Code.expect(inStub.called).to.be.true();

    done();
  });

  lab.experiment('operators', function () {
    lab.experiment('diffRelativeDate', function () {
      lab.test('calls options fn if relativeDate not equal', function (done) {
        var fnStub = sinon.stub();

        var d1 = new Date(1998, 7, 6);
        var d2 = new Date(1987, 6, 5);
        compare(d1, d2, {
          hash: { operator: 'diffRelativeDate' },
          fn: fnStub
        });

        Code.expect(fnStub.called).to.be.true();

        done();
      });
    });

    lab.experiment('isOwner', function () {
      var operator = 'isOwner';

      lab.test('calls options inverse if not owner', function (done) {
        var inStub = sinon.stub();
        /*
          T & T & F
          T & F
          F
        */

        var tests = [
          // third fails
          {
            page: {
              author: true, authorEmail: true, authorURL: true
            },
            comment: {
              author: true, authorEmail: true, authorURL: false
            }
          },
          // second fails
          {
            page: {
              author: true, authorEmail: true, authorURL: true
            },
            comment: {
              author: true, authorEmail: false, authorURL: true
            }
          },
          // first fails
          {
            page: {
              author: true, authorEmail: true, authorURL: true
            },
            comment: {
              author: false, authorEmail: true, authorURL: true
            }
          }
        ];

        var testL = tests.length;

        for (var i = 0; i < testL; i++) {
          var t = tests[i];
          compare(t.page, t.comment, {
            hash: { operator: operator },
            inverse: inStub
          });
        }

        Code.expect(inStub.callCount).to.equal(testL);

        done();
      });

      lab.test('calls options fn if author attributes all equal', function (done) {
        var fnStub = sinon.stub();

        var page = {
          author: 'J Perf',
          authorEmail: 'j@perf.co',
          authorURL: 'jsperf.com'
        };
        var comment = {
          author: 'J Perf',
          authorEmail: 'j@perf.co',
          authorURL: 'jsperf.com'
        };

        compare(page, comment, {
          hash: { operator: operator },
          fn: fnStub
        });

        Code.expect(fnStub.called).to.be.true();
        Code.expect(comment).to.include({ isOwner: true });

        done();
      });
    });
  });
});
