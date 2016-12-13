#!/usr/bin/env node
'use strict';

const Dasein = require('..');

const internals = {};

internals.dasein = new Dasein();

internals.main = () => {

  internals.dasein.run().then(() => {

    process.exit(0);
  }).catch((err) => {

    console.error(err.stack || err.message || err);
    process.exit(1);
  });
};

internals.main();
