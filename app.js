'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const { sequelize } = require('./models/index');
const routes = require('./routes');
const asyncHandler = require('./middleware/async-handler');
const cors = require('cors');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup cors to allow our client to communicate with the API
app.use(cors());

// setup morgan which gives us http request logging
// concise output colored by response status for development use
app.use(morgan('dev'));

// Parsing incoming data to JSON
app.use(express.json());

// Authenticate connection to the database
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection to the database has been successfully established.');
  })
  .catch(err => {
    console.log('Connection to the database failed: ', err);
  });

// Use the '/routes/index.js' router to handle requests to '/api' 
app.use('/api', routes);

// setup a friendly greeting for the root route
app.get('/', asyncHandler(async (req, res) => {
  res.json({
    message: 'This is an API SQLite Database for the Researchers Refuge Website',
  });
}));

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  let errors;
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }
  
  // Checks and deals with validation errors
  if (err.name === 'SequelizeValidationError') {
    err.status = 400;
    errors = err.errors.map(err => err.message);
    console.error('Validation errors: ', errors);
  }

  // Checks and deals with unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    err.status = 400;
    err.message = 'The email is already in use.';
    console.error('Unique Constraint Error: ', err.message);
  }

  // if the error doesn't have any values it defaults to '500 - Internal Server Error'
  res.status(err.status || 500).json({
    name: err.name,
    message: (errors || err.message)
  });
});

module.exports = app;
