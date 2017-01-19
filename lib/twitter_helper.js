'use strict';

const Co = require('co');
const OAuth = require('oauth');
const Pify = require('pify');

const internals = {};

internals.kRequestTokenUrl = 'https://api.twitter.com/oauth/request_token';
internals.kAccessTokenUrl = 'https://api.twitter.com/oauth/access_token';
internals.kVerifyCredentialsUrl = 'https://api.twitter.com/1.1/account/verify_credentials.json';
internals.kOauthVersion = '1.0A';
internals.kOauthSignatureMethod = 'HMAC-SHA1';

module.exports = internals.TwitterHelper = class TwitterHelper {

  constructor(config) {

    this._oAuth = new OAuth.OAuth(
      internals.kRequestTokenUrl,
      internals.kAccessTokenUrl,
      config.consumerKey,
      config.consumerSecret,
      internals.kOauthVersion,
      null,
      internals.kOauthSignatureMethod
    );
  }

  getRequestToken() {

    const self = this;

    return Co(function * () {

      const getOAuthRequestToken = Pify(self._oAuth.getOAuthRequestToken.bind(self._oAuth), { multiArgs: true });
      const [oAuthToken, oAuthTokenSecret] = yield getOAuthRequestToken();

      return {
        oAuthToken,
        oAuthTokenSecret
      };
    });
  }

  getAccessToken(oAuthToken, oAuthVerifier) {

    const self = this;

    return Co(function * () {

      const getOAuthAccessToken = Pify(self._oAuth.getOAuthAccessToken.bind(self._oAuth), { multiArgs: true });
      const [oAuthAccessToken, oAuthAccessTokenSecret] = yield getOAuthAccessToken(oAuthToken,
                                                                                   '',
                                                                                   oAuthVerifier);

      return {
        oAuthAccessToken,
        oAuthAccessTokenSecret
      };
    });
  }

  getUser(oAuthAccessToken, oAuthAccessTokenSecret) {

    const self = this;

    return Co(function * () {

      const get = Pify(self._oAuth.get.bind(self._oAuth), { multiArgs: true });
      const [userResponse] = yield get(internals.kVerifyCredentialsUrl,
                                       oAuthAccessToken,
                                       oAuthAccessTokenSecret);

      return JSON.parse(userResponse);
    });
  }
};
