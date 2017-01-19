'use strict';

const Getenv = require('getenv');

const internals = {};

module.exports = internals.Config = {
  cookieKeys: Getenv.array('DASEIN_COOKIE_KEYS'), // Signatures for the cookies
  port: Getenv.int('DASEIN_PORT', 1927), // Port to listen on
  hostname: Getenv('DASEIN_HOSTNAME', 'localhost'), // Domain to listen on, used for cookies
  staticDirectory: Getenv('DASEIN_STATIC_DIRECTORY', 'static'), // Location of static assets
  jwt: {
    cookieName: Getenv('DASEIN_JWT_COOKIE_NAME', 'dasein_jwt'), // Name of cookie where jwt is stored
    duration: Getenv('DASEIN_JWT_DURATION', 86400), // Duration of JWT (24 hours)
    secret: Getenv('DASEIN_JWT_SECRET') // Secret to sign JWT
  },
  twitter: {
    consumerKey: Getenv('DASEIN_TWITTER_CONSUMER_KEY'), // Consumer key for twitter
    consumerSecret: Getenv('DASEIN_TWITTER_CONSUMER_SECRET') // Consumer secret for twitter
  }
};
