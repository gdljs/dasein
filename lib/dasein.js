'use strict';

const Koa = require('koa');
const KoaStatic = require('koa-static');
const KoaRoute = require('koa-route');

const AuthHandler = require('./handlers/auth');
const PostsHandler = require('./handlers/posts');

const internals = {};

internals.k401Location = '/401.html';
internals.kMainLocation = '/';

/**
 * The Dasein class is the main entry point for the application.
 *
 * @class Dasein
 * @param {Dasein.tConfiguration} config the initialization options to
 * extend the instance
 */
module.exports = internals.Dasein = class Dasein {

  constructor(config) {

    Object.assign(this, config);
  }

  /**
   * Initializes the application and starts listening. Also prints a
   * nice robotic banner with information.
   *
   * @function run
   * @memberof Dasein
   * @instance
   */
  run() {

    this._initializeServer();
    this._startServer();
    this._printBanner();

    return Promise.resolve();
  }

  // Initializes the Koa application and all the handlers.

  _initializeServer() {

    this._app = Koa();

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

    // Handlers for Twitter Auth Related Routes

    const authHandler = new AuthHandler({
      jwt: this.jwt,
      twitter: this.twitter
    });
    this._app.use(KoaRoute.get('/api/login', authHandler.login()));
    this._app.use(KoaRoute.get('/api/login-callback', authHandler.callback()));

    // Handlers for posts

    const postsHandler = new PostsHandler({
      ttl: this.ttl
    });
    this._app.use(KoaRoute.get('/api/posts', postsHandler.findAll()));
    this._app.use(KoaRoute.get('/api/posts/:id', postsHandler.find()));
    this._app.use(KoaRoute.post('/api/posts', postsHandler.create()));
    this._app.use(KoaRoute.delete('/api/posts/:id', postsHandler.delete()));

    // The index

    this._app.use(function * () {

      if (this.state.user) {
        this.body = `<img src="${this.state.user.profile_image_url_https}"> Hello ${this.state.user.screen_name}`;
        return;
      }

      this.body = 'Go to /api/login to login';
      return;
    });
  }

  // Starts listening

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
