'use strict';

const Co = require('co');
const TwitterHelper = require('../twitter_helper');
const JsonWebToken = require('jsonwebtoken');
const Pify = require('pify');

const internals = {};

internals.kRedirectUrl = 'https://api.twitter.com/oauth/authenticate?oauth_token=';
internals.kMainLocation = '/';

internals.signJsonWebToken = Pify(JsonWebToken.sign);

module.exports = internals.AuthHandler = class AuthHandler {

  constructor(config) {

    this._twitterHelper = new TwitterHelper(config.twitter);
    this._jwtConfig = config.jwt;
    this._hostname = config.hostname;
  }

  login() {

    const twitterHelper = this._twitterHelper;

    return function *handleLogin() {

      if (this.state.user) {
        return this.redirect(internals.kMainLocation);
      }

      const requestToken = yield twitterHelper.getRequestToken();
      this.redirect(`${internals.kRedirectUrl}${requestToken.oAuthToken}`);
    };
  }

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

      yield self._setJWT(user, this);

      this.redirect(internals.kMainLocation);
    };
  }

  logout() {

    const self = this;

    return function * () {

      this.cookies.set(self._jwtConfig.cookieName, null);
      this.redirect(internals.kMainLocation);
    };
  }

  // Sets a JSON Web Token Cookie
  _setJWT(payload, context) {

    const self = this;

    return Co(function * () {

      const token = yield internals.signJsonWebToken(payload, self._jwtConfig.secret, {
        expiresIn: self._jwtConfig.duration
      });

      context.cookies.set(self._jwtConfig.cookieName, token, {
        maxAge: self._jwtConfig.duration * 1000,
        signed: true,
        domain: self._hostname,
        overwrite: true
      });
    });
  }
};
