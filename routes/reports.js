const express = require('express');
const router = express.Router();

const moment = require('moment');

// Import middlewares
const asyncHandler = require('../middleware/async-handler');
const authenticateLogin = require('../middleware/user-auth');

// Import Models
const { Article, User, Topic, Category, Report } = require('../models');

// Import Op
const { Op } = require('../models').Sequelize;

// redirects users
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Reports can only be accessed with the correct authorization and through its designated admin route'});
});

// GET finds and sends back a specific articles by tag
router.post('/', authenticateLogin, asyncHandler(async (req, res) => {
  req.body.userId = req.currentUser.id;
  await Report.create(req.body);
  res.status(201).end();
}));

module.exports = router;