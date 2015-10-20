'use strict';

var koa = require('koa');
var http = require('http');
var https = require('https');
var fs = require('fs');
var forceSSL = require('koa-force-ssl');
var jwk = require('jsonwebtoken');
var Promise = require('bluebird');
var bodyParser = require('koa-bodyparser');

var config = require('./config');

var app = koa()

// Force SSL on all page
app.use(forceSSL(config.securePort));

app.use(bodyParser());

var router = require('koa-router')();

router.post('/login', function * (next) {

  let jwt = jwk.decode(this.request.body.jwt);

  let login = jwt.login;

  switch(login) {
    case 'timeout':
      let timeout = 2000;

      console.log('Response: timeout - waiting: ', timeout); //XXX

      yield Promise.delay(timeout);

      console.log('Response: timeout - sent'); //XXX

      this.body = {};

      yield next;
      break;
    case '200':
      this.body = {
        param1: 'param1',
        error: 'error',
        code: 'code'
      };

      console.log('Response: 200 - ', this.body); //XXX

      yield next;
      break;
    case '204':
      this.body = {};
      console.log('Response: 204'); //XXX
      yield next;
      break;
    case '401':
      console.log('Response: 401 - Invalid credentials'); //XXX

      this.status = 401;
      break;
    default:
      this.body = {};

      console.log('Response: 500 - Unknown request'); //XXX

      this.status = 500;
  }

});

app.use(router.routes());
app.use(router.allowedMethods());

// SSL options
var options = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
}

// start the server
http.createServer(app.callback()).listen(config.port);
https.createServer(options, app.callback()).listen(config.securePort);