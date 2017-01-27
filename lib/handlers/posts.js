'use strict';

const Redis = require('redis');

const internals = {};

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

    return function * () {

      this.body = [];
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

    return function * () {

      this.body = {};
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
