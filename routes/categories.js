const express = require('express');
const router = express.Router();

// Import middlewares
const asyncHandler = require('../middleware/async-handler');

// Import Models
const { Article, User, Topic, Category } = require('../models');

// Import Op
const { Sequelize } = require('../models');
const { Op } = Sequelize;

// GET finds and sends back all the categories and all the topics that are a part of it
router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.findAll({
    attributes: ['id', 'name'], 
    include: [{ model: Topic, attributes: ['categoryId','id', 'name', 'relatedTags'] }]});

  res.status(200).json(categories);
}));

// GET finds specified category and basic info on its owner
router.get('/', asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.query.id, {
    attributes: ['id', 'name'], 
    include: [{ model: Topic, attributes: ['categoryId','id', 'name', 'relatedTags'] }]});
  if (category) {
    res.status(200).json(category);
  } else {
    res.status(404).end();
  }
}));

// GET finds and sends back specific categories by query
router.get('/query', asyncHandler(async (req, res) => {
  const categories = await Category.findAll({
    attributes: ['id', 'name'], 
    include: [{ 
      model: Topic,
      attributes: ['id', 'name', 'relatedTags'],
      include: [ { 
        model: Article, 
        attributes: ['id', 'title', 'topic', 'intro', 'body', 'tags', 'userId', 'topicId', 'published', 'credits'],
        include: [{
          model: User,
          attributes: ['firstName', 'lastName']
        }],
      }],
    }],
    where: { name: { [Op.substring]: req.query.query } }
  });

  if( categories ) {
    res.status(200).json(categories);
  } else {
    res.status(404).end();
  }
}));

module.exports = router;