process.env.NODE_ENV = 'test';

var assert = require('assert');
var connect = require('connect');
var flash = require('connect-flash');
var request = require('supertest');
var session = require('..');


describe('Cookie Session with flash message', function(){
  var cookie;
  it('should Set-Cookie', function(done){
    var app = App();
    app.use(flash());
    app.use(function (req, res, next) {
      req.flash('info', 'hello world');
      res.end(req.session.flash);
    })

    request(app)
      .get('/')
      .expect(200)
      .expect({info: ['hello world']})
      .end(function(err, res) {
        cookie = res.header['set-cookie'].join(';');
        assert(cookie);
        done();
      })
  });

  it('should persist', function(done){
    var app = App();
    app.use(flash());
    app.use(function (req, res, next) {
      var flashMessages = req.session.flash;
      //sending the object directly without stringification causes a 500 error
      var flashStr = JSON.stringify(flashMessages);
      console.log("we see:", flashStr)
      res.end(flashStr);
    })

    assert(cookie)

    request(app)
      .get('/')
      .set('Cookie', cookie)
      .expect(200)
      .end(function(err, res) {
        assert.deepEqual(res.body, {info: ['hello world']})
        done()
      })
  });
});


function App(options) {
  options = options || {};
  options.keys = ['a', 'b'];
  var app = connect();
  app.use(session(options));
  return app;
}
