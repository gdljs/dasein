#!/usr/bin/env node
'use strict';

const Config = require('../config/config');
const Dasein = require('..');

const internals = {};

internals.dasein = new Dasein(Config);

internals.main = () => {

  internals.dasein.run().catch((err) => {

    console.error(err.stack || err.message || err);
    process.exit(1);
  });
};

internals.main();
