const express = require('express');
const router = express.Router();

// Import middlewares
const asyncHandler = require('../middleware/async-handler');
const authenticateLogin = require('../middleware/user-auth');

// Import Models
const { Article, User, Topic, Category } = require('../models');

// Import Op
const { Sequelize } = require('../models');
const { Op } = Sequelize;

// Helper function
const isStringAndStringToArray = (value) => {
  if (typeof value !== 'object') {
    if (value.length === 1 || typeof value === 'number') {
      return [value.toString()];
    } else if (value === '') {
      return [];
    } else {
      return value.split(',').filter(entry => entry !== ' ' && entry !== '');
    }
  } else {
    return value;
  }
}


// GET finds and displays all topics
router.get('/', asyncHandler(async (req, res) => {
  const topics = await Topic.findAll({
    attributes: ['id', 'name', 'relatedTags', 'categoryId']
  });

  res.status(200).json(topics);
}));

// GET finds and sends back a specific topics by tag
router.get('/tag', asyncHandler(async (req, res) => {
  const topics = await Topic.findAll({
    attributes: ['id', 'name', 'relatedTags', 'categoryId'],
    where: { relatedTags: { [Op.substring]: req.query.tag } }
  });

  if( topics ) {
    res.status(200).json(topics);
  } else {
    res.status(404).end();
  }
}));

// GET finds and sends back specific topics by query
router.get('/query', asyncHandler(async (req, res) => {
  const topics = await Topic.findAll({
    attributes: ['id', 'name', 'relatedTags', 'categoryId'],
    where: { 
      [Op.or]: [
      { name: { [Op.substring]: req.query.query } },
      { relatedTags: { [Op.substring]: req.query.query } }
    ]}
  });

  if( topics ) {
    res.status(200).json(topics);
  } else {
    res.status(404).end();
  }
}));

// GET finds and displays a specific topic by name
router.get('/name', asyncHandler(async (req, res) => {
  const topic = await Topic.findOne({
    attributes: ['id', 'name', 'relatedTags', 'categoryId'],
    where: { name: req.query.name }
  });

  if( topic ) {
    res.status(200).json(topic);
  } else {
    res.status(404).end();
  }
}));

// GET finds and displays a specific topic by ID
router.get('/id', asyncHandler(async (req, res) => {
  const topic = await Topic.findByPk(req.query.id, {
    attributes: ['id', 'name', 'relatedTags', 'categoryId']
  });

  if( topic ) {
    res.status(200).json(topic);
  } else {
    res.status(404).end();
  }
}));

// GET finds and displays recommended topics
router.get('/recommended', authenticateLogin, asyncHandler(async (req, res) => {
  const user = await User.findOne({ 
    attributes: ['accreditedArticles'],
    where: { emailAddress: req.currentUser.emailAddress } 
  });
  const accreditedArticles = isStringAndStringToArray(user.accreditedArticles);
  const articles = await Article.findAll({
    attributes: ['topicId'],
    where: { id: { [Op.in]: accreditedArticles } }
  });
  const articleTopicIds = articles.map( article => article.topicId );
  const topics = await Topic.findAll({
    attributes: ['id', 'name'],
    where: { id: { [Op.in]: articleTopicIds } }
  });

  if( topics ) {
    res.status(200).json(topics.slice(0,3));
  } else {
    res.status(404).end();
  }
}));

// POST creates a new topic ( Admin Only )
router.post('/admin', authenticateLogin, asyncHandler(async (req, res) => {
  const isAdmin = req.currentUser.accessLevel === 'admin';
  if (isAdmin) {
    const topic = await Topic.create(req.body);
    res.location(`/api/topics/${topic.id}`).status(201).end();
  } else {
    res.status(403).end();
  }
}));

// PUT updates the chosen topic ( Admin Only )
router.put('/', authenticateLogin, asyncHandler(async (req, res) => {
  const isAdmin = req.currentUser.accessLevel === 'admin';
  if (isAdmin) {
    await Topic.update(req.body, { where: { id: req.query.id } })
      .then(response => {
        if (!response.name) {
          res.status(204).end()
        }
      });
  } else {
    res.status(403).end();
  }
}));

// DELETE deletes the chosen topic ( Admin Only )
router.delete('/', authenticateLogin, asyncHandler(async (req, res) => {
  const isAdmin = req.currentUser.accessLevel === 'admin';
  if (isAdmin) {
    await Topic.destroy({ where: { id: req.query.id } })
      .then(res.status(204).end());
  } else {
    res.status(403).end();
  }
}));

module.exports = router;