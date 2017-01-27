'use strict';

const Getenv = require('getenv');

const internals = {};

/**
 * The main configuration object for Dasein. It will be used to
 * initialize all of the sub-components. It can extend any property of
 * the dasein object.
 *
 * @memberof Dasein
 * @typedef {object} tConfiguration
 * @property {number} [port=1927] the port where the app will listen on
 * @property {string} [staticDirectory=static] the path, relative to the
 * project root, where static assets live
 * @property {number} [ttl=180] the time in seconds that posts
 * remain alive
 * @property {Dasein.tRedisConfiguration} redis the configuration to
 * connect to the redis server
 * @property {Dasein.tJWTConfiguration} jwt the configuration for the
 * JWT authentication
 * @property {Dasein.tTwitterConfiguration} twitter the configuration
 * for twitter integration
 */
module.exports = internals.Config = {
  port: Getenv.int('DASEIN_PORT', 1927),
  staticDirectory: Getenv('DASEIN_STATIC_DIRECTORY', 'static'),
  ttl: Getenv.int('DASEIN_TTL', 180),

  /**
   * Configures the behavior of the JWT token.
   *
   * @memberof Dasein
   * @typedef {object} tJWTConfiguration
   * @property {number} [duration=86400] the duration of the JWT in
   * seconds
   * @property {string} secret the secret used to sign the JWT
   */
  jwt: {
    duration: Getenv.int('DASEIN_JWT_DURATION', 86400),
    secret: Getenv('DASEIN_JWT_SECRET')
  },

  /**
   * Information required to connect to the redis server
   *
   * @memberof Dasein
   * @typedef {object} tRedisConfiguration
   * @property {string} host the location of the redis host
   * @property {string} [post=6379] port where redis server is listening
   */
  twitter: {
    host: Getenv('DASEIN_REDIS_HOST'),
    port: Getenv.int('DASEIN_REDIS_PORT', 6379)
  }

  /**
   * Configures the twitter integration values
   *
   * @memberof Dasein
   * @typedef {object} tTwitterConfiguration
   * @property {string} consumerKey The consumer key used to authenticate
   * with the twitter API
   * @property {string} consumerSecret the consumer secret used to
   * authenticate with the twitter API
   */
  twitter: {
    consumerKey: Getenv('DASEIN_TWITTER_CONSUMER_KEY'),
    consumerSecret: Getenv('DASEIN_TWITTER_CONSUMER_SECRET')
  }
};
