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

/**
 * Helper to communicate with the twitter API
 *
 * @class TwitterHelper
 * @param {Dasein.tTwitterConfiguration} config the configuration to
 * initialize the twitter API
 * @see {@link https://dev.twitter.com/web/sign-in/implementing|Implementing
 * Sign in with Twitter}
 *
 */
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

  /**
   * Calls the API to get a request token.
   *
   * @function getRequestToken
   * @memberof TwitterHelper
   * @instance
   * @return {Promise<TwitterHelper.tRequestToken>} the request token response
   */
  getRequestToken() {

    const self = this;

    return Co(function * () {

      const getOAuthRequestToken = Pify(self._oAuth.getOAuthRequestToken.bind(self._oAuth), { multiArgs: true });
      const [oAuthToken, oAuthTokenSecret] = yield getOAuthRequestToken();

      /**
       * The request token and secret pair from the twitter API
       *
       * @memberof TwitterHelper
       * @typedef {object} tRequestToken
       * @property {string} oAuthToken The oAuth request token
       * @property {string} oAuthTokenSecret The oAuth request token
       * secret
       */
      return {
        oAuthToken,
        oAuthTokenSecret
      };
    });
  }

  /**
   * Calls the API to get an access token
   *
   * @function getAccessToken
   * @memberof TwitterHelper
   * @instance
   * @param {string} oAuthToken An oAuth request token
   * @param {string} oAuthVerifier An oAuth verifier sent from the
   * twitter callback
   * @return {Promise<TwitterHelper.tAccessToken>} the acess token response
   */
  getAccessToken(oAuthToken, oAuthVerifier) {

    const self = this;

    return Co(function * () {

      const getOAuthAccessToken = Pify(self._oAuth.getOAuthAccessToken.bind(self._oAuth), { multiArgs: true });
      const [oAuthAccessToken, oAuthAccessTokenSecret] = yield getOAuthAccessToken(oAuthToken,
                                                                                   '',
                                                                                   oAuthVerifier);

      /**
       * The access token and secret pair from the twitter API
       *
       * @memberof TwitterHelper
       * @typedef {object} tAccessToken
       * @property {string} oAuthAccessToken The oAuth access token
       * @property {string} oAuthAccessTokenSecret The oAuth access token
       * secret
       */
      return {
        oAuthAccessToken,
        oAuthAccessTokenSecret
      };
    });
  }

  /**
   * Gets a user object from twitter
   *
   * @function getUser
   * @memberof TwitterHelper
   * @instance
   * @param {string} oAuthAccessToken An oAuth access token
   * @param {string} oAuthAccessTokenSecret An oAuth access token secret
   * @return {Promise<external:TwitterUser>} the user object from
   * twitter
   */
  getUser(oAuthAccessToken, oAuthAccessTokenSecret) {

    const self = this;

    return Co(function * () {

      const get = Pify(self._oAuth.get.bind(self._oAuth), { multiArgs: true });
      const [userResponse] = yield get(internals.kVerifyCredentialsUrl,
                                       oAuthAccessToken,
                                       oAuthAccessTokenSecret);

      /**
       * The twitter user from the API
       * @external TwitterUser
       * @see {@link https://dev.twitter.com/overview/api/users|Twitter
       * Api Overview: Users}
       */
      return JSON.parse(userResponse);
    });
  }
};
