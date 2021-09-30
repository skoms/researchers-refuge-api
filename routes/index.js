const express = require('express');
const router = express.Router();

// Import other routers
const usersRoute = require('./users');
const articlesRoute = require('./articles');
const topicsRoute = require('./topics');
const categoriesRoute = require('./categories');
const adminRoute = require('./admin');

// Separate the routes into separate files for better modularity and readability
router.use('/users', usersRoute);
router.use('/articles', articlesRoute);
router.use('/topics', topicsRoute);
router.use('/categories', categoriesRoute);
router.use('/admin', adminRoute);

// welcomes and redirects users
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to my API, please refer to: \n"/api/users" for users \n"/api/articles" for articles \n"/api/topics" for topics \n"/api/categories" for categories '});
});

module.exports = router;