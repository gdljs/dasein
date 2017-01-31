'use strict';

const Joi = require('joi');
const Pify = require('pify');
const Redis = require('redis');
const UUID = require('uuid/v4');

const internals = {};

internals.kPostsPrefix = 'posts';
internals.kCommentsPrefix = 'comments';
internals.kMaxCommentSize = 255;

internals.kCommentsSchema = Joi.object().keys({
  uuid: Joi.string().required(),
  content: Joi.string().max(internals.kMaxCommentSize).required(),
  timestamp: Joi.number().integer().required(),
  userId: Joi.string().required(),
  userName: Joi.string().required(),
  userImage: Joi.string().required()
});

/**
 * Handles the HTTP requests for comment related operations
 *
 * @class CommentsHandler
 * @param {Dasein.tConfiguration} config The configuration to
 * initialize.
 */
module.exports = internals.CommentsHandler = class CommentsHandler {
  constructor(config) {

    this._ttl = config.ttl;
    this._redis = Redis.createClient(config.redis);

    // Log an error if it happens.
    this._redis.on('error', (err) => {

      console.error(err);
    });
  }

  /**
   * Fetches all available comments
   *
   * @function findAll
   * @memberof CommentsHandler
   * @instance
   * @return {generator} a koa compatible handler generator function
   */
  findAll() {

    const self = this;

    return function * (postId) {

      if (!this.state.user) {
        return this.throw('Unauthorized', 401);
      }

      const scan = Pify(self._redis.scan.bind(self._redis));
      const hgetall = Pify(self._redis.hgetall.bind(self._redis));

      const commentsKey = `${internals.kCommentsPrefix}:${postId}:*`;
      let keys = [];
      let nextCursor = 0
      let currentKeys = null;

      do {
        [nextCursor, currentKeys] = yield scan(nextCursor || 0, 'MATCH', commentsKey);
        keys = keys.concat(currentKeys);
      } while (nextCursor > 0);

      const comments = yield keys.map((key) => hgetall(key));

      this.body = comments.sort((a, b) => a.timestamp - b.timestamp);
    };
  }

  /**
   * Creates a comment
   *
   * @function create
   * @memberof CommentsHandler
   * @instance
   * @return {generator} a koa compatible handler generator function
   */
  create() {

    const self = this;

    return function * (postId) {

      if (!this.state.user) {
        return this.throw('Unauthorized', 401);
      }

      const hmset = Pify(self._redis.hmset.bind(self._redis));
      const hgetall = Pify(self._redis.hgetall.bind(self._redis));
      const expire = Pify(self._redis.expire.bind(self._redis));

      const uuid = UUID();
      const timestamp = Date.now();
      const user = this.state.user;

      const postKey = `${internals.kPostsPrefix}:${postId}`;
      const commentKey = `${internals.kCommentsPrefix}:${postId}:${uuid}`;

      const comment = {
        uuid,
        content: this.request.body.content,
        timestamp,
        userId: user.screen_name,
        userName: user.name,
        userImage: user.profile_image_url_https
      };

      yield self._validate(comment).catch((err) => {

        this.throw(err.message, 422);
      });

      yield hmset(commentKey, comment);
      yield expire(commentKey, self._ttl * 100); // this is me being lazy :(
                                                 // comments will last at most 100 bumps
                                                 // but will disappear eventually
      yield expire(postKey, self._ttl); // bumps the parent comment TTL

      this.body = yield hgetall(commentKey);
    };
  }

  // Validates the comment schema

  _validate(comment) {

    const validate = Pify(Joi.validate.bind(Joi));
    return validate(comment, internals.kCommentsSchema);
  }
};
