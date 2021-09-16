'use strict';

// This is called when the command 'npm run seed' is being called

const promiseFinally = require('promise.prototype.finally');
const Database = require('./database');
const data = require('./data.json');

const enableLogging = process.env.DB_ENABLE_LOGGING === 'true';
const database = new Database(data, enableLogging);

// intercept API calls and create an abstract layer between the caller and the target
promiseFinally.shim();

// initialize the new database
database.init()
  .catch(err => console.error(err))
  .finally(() => process.exit());
