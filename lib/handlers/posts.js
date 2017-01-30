'use strict';

const Joi = require('joi');
const Pify = require('pify');
const Redis = require('redis');
const UUID = require('uuid/v4');

const internals = {};

internals.kPostsPrefix = 'posts';
internals.kMaxPostSize = 255;

internals.kPostsSchema = Joi.object().keys({
  uuid: Joi.string().required(),
  content: Joi.string().max(internals.kMaxPostSize).required(),
  timestamp: Joi.number().integer().required(),
  userId: Joi.string().required(),
  userName: Joi.string().required(),
  userImage: Joi.string().required()
});

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

      if (!this.state.user) {
        return this.throw('Unauthorized', 401);
      }

      const scan = Pify(self._redis.scan.bind(self._redis));
      const hgetall = Pify(self._redis.hgetall.bind(self._redis));

      const cursor = parseInt(this.request.query.cursor) || 0;
      const [nextCursor, keys] = yield scan(cursor, 'MATCH', `${internals.kPostsPrefix}:*`);

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

    const self = this;

    return function * (uuid) {

      if (!this.state.user) {
        return this.throw('Unauthorized', 401);
      }

      const hgetall = Pify(self._redis.hgetall.bind(self._redis));

      const postKey = `${internals.kPostsPrefix}:${uuid}`;

      const post = yield hgetall(postKey);

      if (!post) {
        this.throw('Post not found', 404);
      }

      this.body = post;
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

      if (!this.state.user) {
        return this.throw('Unauthorized', 401);
      }

      const hmset = Pify(self._redis.hmset.bind(self._redis));
      const hgetall = Pify(self._redis.hgetall.bind(self._redis));
      const expire = Pify(self._redis.expire.bind(self._redis));

      const uuid = UUID();
      const timestamp = Date.now();
      const user = this.state.user;

      const postKey = `${internals.kPostsPrefix}:${uuid}`;

      const post = {
        uuid,
        content: this.request.body.content,
        timestamp,
        userId: user.screen_name,
        userName: user.name,
        userImage: user.profile_image_url_https
      };

      yield self._validate(post).catch((err) => {

        this.throw(err.message, 422);
      });

      yield hmset(postKey, post);
      yield expire(postKey, self._ttl);

      this.body = yield hgetall(postKey);
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

  // Validates the post schema

  _validate(post) {

    const validate = Pify(Joi.validate.bind(Joi));
    return validate(post, internals.kPostsSchema);
  }
};
