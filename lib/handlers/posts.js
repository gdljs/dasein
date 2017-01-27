'use strict';

const Pify = require('pify');
const Redis = require('redis');
const UUID = require('uuid/v4');

const internals = {};

internals.kPostsPrefix = 'posts';

/**
 * Handles the HTTP requests for posts related operations
 *
 * @class PostsHandler
 * @param {Dasein.tConfiguration} config The configuration to
 * initialize.
 */
module.exports = internals.PostsHandler = class PostsHandler {
  constructor(config) {

    this._ttl = config.ttl;
    this._redis = Redis.createClient(config.redis);

    // Log an error if it happens.
    this._redis.on('error', (err) => {

      console.error(err);
    });
  }

  /**
   * Fetches all available posts
   *
   * @function findAll
   * @memberof PostsHandler
   * @instance
   * @return {generator} a koa compatible handler generator function
   */
  findAll() {

    const self = this;

    return function * () {

      const scan = Pify(self._redis.scan.bind(self._redis));
      const hgetall = Pify(self._redis.hgetall.bind(self._redis));

      const searchKey = `${internals.kPostsPrefix}:*`;
      const cursor = parseInt(this.request.query.cursor) || 0;
      const [nextCursor, keys] = yield scan(cursor, 'MATCH', searchKey);

      if (nextCursor > 0) {
        this.append('Link', `<${this.request.origin}${this.request.path}?cursor=${nextCursor}>; rel="next"`);
      }

      const posts = yield keys.map((key) => hgetall(key));

      this.body = posts;
    };
  }

  /**
   * Fetches a single post
   *
   * @function find
   * @memberof PostsHandler
   * @instance
   * @return {generator} a koa compatible handler generator function
   */
  find() {

    return function * () {

      this.body = {};
    };
  }

  /**
   * Creates a post
   *
   * @function create
   * @memberof PostsHandler
   * @instance
   * @return {generator} a koa compatible handler generator function
   */
  create() {

    const self = this;

    return function * () {

      const hmset = Pify(self._redis.hmset.bind(self._redis));
      const hgetall = Pify(self._redis.hgetall.bind(self._redis));
      const expire = Pify(self._redis.expire.bind(self._redis));

      const uuid = UUID();
      const key = `${internals.kPostsPrefix}:${uuid}`;

      let post = [];

      post = post.concat(['uuid', uuid]);
      post = post.concat(['user', 'test']);
      post = post.concat(['content', `Imagined post from: ${Date.now()}`]);

      yield hmset(key, post);
      yield expire(key, self._ttl);

      this.body = yield hgetall(key);
    };
  }

  /**
   * Deletes a post
   *
   * @function delete
   * @memberof PostsHandler
   * @instance
   * @return {generator} a koa compatible handler generator function
   */
  delete() {

    return function * () {};
  }
};
