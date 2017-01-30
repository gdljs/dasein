'use strict';

const Co = require('co');
const JsonWebToken = require('jsonwebtoken');
const Pify = require('pify');
const TwitterHelper = require('../twitter_helper');

const internals = {};

internals.kRedirectUrl = 'https://api.twitter.com/oauth/authenticate?oauth_token=';
internals.kLoginRedirect = '/login';

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
      const loginUrl = `${internals.kRedirectUrl}${requestToken.oAuthToken}`;

      this.body = { loginUrl };
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

      const oAuthToken = this.request.body.oAuthToken;
      const oAuthVerifier = this.request.body.oAuthVerifier;
      let user;

      try {
        const accessToken = yield self._twitterHelper.getAccessToken(oAuthToken, oAuthVerifier);
        user = yield self._twitterHelper.getUser(accessToken.oAuthAccessToken, accessToken.oAuthAccessTokenSecret);
      }
      catch (err) {
        console.error(err.stack || err.message || err);
        return this.throw(401);
      }

      const expiresAt = Date.now() + self._jwtConfig.duration * 1000;

      const token = yield self._getToken(user);

      const response = {
        expiresAt,
        user,
        token
      };

      this.body = response;
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
