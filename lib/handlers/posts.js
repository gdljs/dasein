'use strict';

const internals = {};

/**
 * Handles the HTTP requests for posts related operations
 *
 * @class PostsHandler
 */
module.exports = internals.PostsHandler = class PostsHandler {

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
