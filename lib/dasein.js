'use strict';

const Koa = require('koa');
const KoaJwt = require('koa-jwt');
const KoaStatic = require('koa-static');
const KoaRoute = require('koa-route');

const AuthHandler = require('./handlers/auth');

const internals = {};

internals.k401Location = '/401.html';
internals.kMainLocation = '/';

module.exports = internals.Dasein = class Dasein {

  constructor(config) {

    Object.assign(this, config);
  }

  run() {

    this._initializeServer();
    this._startServer();
    this._printBanner();

    return Promise.resolve();
  }

  _initializeServer() {

    this._app = Koa();

    this._app.keys = this.cookieKeys;

    this._app.use(KoaStatic(this.staticDirectory));

    // Redirect all 401s to the 401 static page

    this._app.use(function * (next) {

      try {
        yield next;
      }
      catch (err) {
        if (err.status === 401) {
          return this.redirect(internals.k401Location);
        }

        throw err;
      }
    });

    this._app.use(KoaJwt({
      secret: this.jwt.secret,
      passthrough: true,
      cookie: this.jwt.cookieName
    }));

    // Handlers for Twitter Auth Related Routes

    const authHandler = new AuthHandler({
      hostname: this.hostname,
      jwt: this.jwt,
      twitter: this.twitter
    });
    this._app.use(KoaRoute.get('/login', authHandler.login()));
    this._app.use(KoaRoute.get('/login-callback', authHandler.callback()));
    this._app.use(KoaRoute.get('/logout', authHandler.logout()));

    // The index

    this._app.use(function * () {

      if (this.state.user) {
        this.body = `<img src="${this.state.user.profile_image_url_https}"> Hello ${this.state.user.screen_name}`;
        return;
      }

      this.body = 'Go to /login to login';
      return;
    });
  }

  _startServer() {

    this._app.listen(this.port);
  }

  // Prints the banner.
  _printBanner() {

    console.log('        .');
    console.log('       /');
    console.log('    +-----+');
    console.log(`    | o o |  - Listening Gladly, Try me on port: ${this.port}`);
    console.log('    +-----+');
    console.log('  +---------+');
    console.log(' /|    [][] |\\');
    console.log(' ||         | |');
    console.log(' ||         |  \\c');
    console.log(' ^+---------+');
    console.log('      (.) ');
  }
};
