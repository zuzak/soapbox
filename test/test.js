/* eslint-env mocha */
var app = require('..')
var request = require('supertest')
require('should') // extends prototypes

describe('running Express.js', function () {
  it('responds with a 404', function (done) {
    request(app)
      .get('/foo')
      .expect(404, done)
  })
})

describe('index page', function () {
  it('should work!', function (done) {
    request(app)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err
        res.text.should.containEql('Hello, World!')
        done()
      })
  })
})

describe('static pages', function () {
  it('should render CSS', function (done) {
    request(app)
      .get('/index.css')
      .expect(200, done)
  })
  it('should render JS', function (done) {
    request(app)
      .get('/auth.js')
      .expect(200, done)
  })
  it('should render the privacy page', function (done) {
    request(app)
      .get('/privacy')
      .expect(200, done)
  })
})

describe('slug generator', function () {
  for (var i = 1; i < 11; i++) {
    it('should work with ' + i + ' characters', function (done) {
      app.genKey(i).length.should.equal(i)
      done()
    })
  }

  it('should not work with 0 characters', function (done) {
    app.genKey().length.should.equal(0)
    app.genKey(-1).length.should.equal(0)
    done()
  })

  it('should be a string', function (done) {
    app.genKey(5).should.be.a.String
    done()
  })
})
