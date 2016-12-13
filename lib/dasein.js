'use strict';

const internals = {};

module.exports = internals.Dasein = class Dasein {

  run() {

    console.log('OK');

    return Promise.resolve();
  }
};
