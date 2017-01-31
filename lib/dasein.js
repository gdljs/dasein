'use strict';

const Koa = require('koa');
const KoaBodyParser = require('koa-bodyparser');
const KoaJwt = require('koa-jwt');
const KoaRoute = require('koa-route');
const KoaSend = require('koa-send');
const KoaStatic = require('koa-static');
const Path = require('path');

const AuthHandler = require('./handlers/auth');
const PostsHandler = require('./handlers/posts');
const CommentsHandler = require('./handlers/comments');

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

    const self = this;

    this._app = Koa();

    this._app.use(KoaStatic(this.staticDirectory));
    this._app.use(KoaBodyParser());

    // Error handler

    this._app.use(function * (next) {

      try {
        yield next;
      }
      catch (err) {
        this.status = err.status || 500;

        const response = {
          error: err.message,
          status: this.status
        };

        if (response.status === 401) {
          response.error === 'Protected resource, use Authorization header to get access';
        }

        this.body = response;

        this.app.emit('error', err, this);
      }
    });

    this._app.use(KoaJwt({
      secret: this.jwt.secret,
      passthrough: true
    }));

    this._initializeAuthRoutes();
    this._initializePostsRoutes();
    this._initializeCommentsRoutes();

    this._app.use(function * () {

      yield KoaSend(this, Path.join(self.staticDirectory, 'index.html'));
    });

  }

  // Initialize routes for auth

  _initializeAuthRoutes() {

    const authHandler = new AuthHandler({
      jwt: this.jwt,
      twitter: this.twitter
    });
    this._app.use(KoaRoute.get('/api/auth/login', authHandler.login()));
    this._app.use(KoaRoute.post('/api/auth/callback', authHandler.callback()));
  }

  // Initialize routes for posts

  _initializePostsRoutes() {

    const postsHandler = new PostsHandler({
      ttl: this.ttl,
      redis: this.redis
    });
    this._app.use(KoaRoute.get('/api/posts', postsHandler.findAll()));
    this._app.use(KoaRoute.get('/api/posts/:id', postsHandler.find()));
    this._app.use(KoaRoute.post('/api/posts', postsHandler.create()));
    this._app.use(KoaRoute.delete('/api/posts/:id', postsHandler.delete()));

  }

  // Initialize routes for comments

  _initializeCommentsRoutes() {

    const commentsHandler = new CommentsHandler({
      ttl: this.ttl,
      redis: this.redis
    });
    this._app.use(KoaRoute.get('/api/posts/:postId/comments', commentsHandler.findAll()));
    this._app.use(KoaRoute.post('/api/posts/:postId/comments', commentsHandler.create()));
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
