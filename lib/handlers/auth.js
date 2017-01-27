'use strict';

const Co = require('co');
const TwitterHelper = require('../twitter_helper');
const JsonWebToken = require('jsonwebtoken');
const Pify = require('pify');

const internals = {};

internals.kRedirectUrl = 'https://api.twitter.com/oauth/authenticate?oauth_token=';
internals.kMainLocation = '/';

internals.signJsonWebToken = Pify(JsonWebToken.sign);

/**
 * Handles the HTTP requests for auth related operations.
 *
 * @class AuthHandler
 * @param {Dasein.tConfiguration} config The configuration to
 * initialize.
 */
module.exports = internals.AuthHandler = class AuthHandler {

  constructor(config) {

    this._twitterHelper = new TwitterHelper(config.twitter);
    this._jwtConfig = config.jwt;
    this._hostname = config.hostname;
  }

  /**
   * Triggers the twitter login flow. Redirects to twitter's oauth
   * request page
   *
   * @function login
   * @memberof AuthHandler
   * @instance
   * @return {generator} a koa compatible handler generator function
   */
  login() {

    const twitterHelper = this._twitterHelper;

    return function *handleLogin() {

      const requestToken = yield twitterHelper.getRequestToken();
      this.redirect(`${internals.kRedirectUrl}${requestToken.oAuthToken}`);
    };
  }

  /**
   * Handles twitter's callback. Fetches the oAuth Verifier, attempts to
   * obtain a user object and responds with the JWT
   *
   * @function callback
   * @memberof AuthHandler
   * @instance
   * @return {generator} a koa compatible handler generator function
   */
  callback() {

    const self = this;

    return function *handleCallback() {

      if (this.request.query.denied) {
        return this.throw(401);
      }

      const oAuthToken = this.request.query.oauth_token;
      const oAuthVerifier = this.request.query.oauth_verifier;
      let user;

      try {
        const accessToken = yield self._twitterHelper.getAccessToken(oAuthToken, oAuthVerifier);
        user = yield self._twitterHelper.getUser(accessToken.oAuthAccessToken, accessToken.oAuthAccessTokenSecret);
      }
      catch (err) {
        console.error(err.stack || err.message || err);
        return this.throw(401);
      }

      const token = yield self._getToken(user);

      this.body = token;
    };
  }

  // Generates a JSON Web Token

  _getToken(payload) {

    const self = this;

    return Co(function * () {

      const token = yield internals.signJsonWebToken(payload, self._jwtConfig.secret, {
        expiresIn: self._jwtConfig.duration
      });

      return token;
    });
  }
};
