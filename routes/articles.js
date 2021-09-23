const express = require('express');
const router = express.Router();

const moment = require('moment');

// Import middlewares
const asyncHandler = require('../middleware/async-handler');
const authenticateLogin = require('../middleware/user-auth');

// Import Models
const { Article, User, Topic, Category } = require('../models');

// Import Op
const { Op } = require('../models').Sequelize;

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

// GET finds and displays all the articles based on filter and basic info on their owners
router.get('/filter', asyncHandler(async (req, res) => {
  const { filter, page } = req.query;
  let articles;
  if (filter === 'top') {
    articles = await Article.findAll({
      include: [ { model: User, attributes: ['firstName', 'lastName'] }],
      order: [['credits', 'DESC']],
      limit: 10,
      offset: page !== 0 ? ((page - 1) * 10) : 0
    });
  } else if (filter === 'new') {
    articles = await Article.findAll({
      include: [ { model: User, attributes: ['firstName', 'lastName'] }],
      order: [['published', 'DESC']],
      limit: 10,
      offset: page !== 0 ? ((page - 1) * 10) : 0
    });
  } else if (filter === 'popular') {
    const aMonthAgo = moment([ moment().year(), moment().month() - 1, moment().date()]).format('YYYY-MM-DD');
    
    articles = await Article.findAll({
      include: [ { model: User, attributes: ['firstName', 'lastName'] }],
      order: [['credits', 'DESC']],
      where: { published: { [Op.gte]: aMonthAgo }},
      limit: 10,
      offset: page !== 0 ? ((page - 1) * 10) : 0
    });
  } else {
    articles = await Article.findAll({
      include: [ { model: User, attributes: ['firstName', 'lastName'] }],
      limit: 10,
      offset: page !== 0 ? ((page - 1) * 10) : 0
    });
  }

  res.status(200).json(articles);
}));

// GET finds and displays recommended topics
router.get('/recommended', authenticateLogin, asyncHandler(async (req, res) => {
  const user = await User.findOne({ 
    attributes: ['accreditedArticles', 'discreditedArticles'],
    where: { emailAddress: req.currentUser.emailAddress } 
  });

  const accreditedArticles = isStringAndStringToArray(user.accreditedArticles);
  const discreditedArticles = isStringAndStringToArray(user.discreditedArticles);
  
  const accreditedOnes = await Article.findAll({
    attributes: ['topicId'],
    where: { id: { [Op.in]: accreditedArticles } }
  });

  const topicIds = new Set(accreditedOnes.map( article => article.topicId ));
  const articles = await Article.findAll({
    attributes: ['id', 'title'],
    where: {
      [Op.and]:[
        { topicId: { [Op.in]: topicIds } },
        { id: { [Op.notIn]: accreditedArticles } },
        { id: { [Op.notIn]: discreditedArticles } }
      ]
    }
  })

  if( articles ) {
    res.status(200).json(articles.slice(0,3));
  } else {
    res.status(404).end();
  }
}));

// GET finds and sends back a specific articles by tag
router.get('/tag', asyncHandler(async (req, res) => {
  const { tag, id, page } = req.query;
  const articles = await Article.findAll({
    attributes: ['id', 'title', 'topic', 'intro', 'body', 'tags', 'userId', 'topicId', 'published', 'credits'], 
    include: [{ model: User, attributes: ['firstName', 'lastName']}],
    where: { [Op.and]: [
        { tags: { [Op.substring]: tag } },
        { id: { [Op.not]: id} },
      ] 
    },
    limit: 10,
    offset: page !== 0 ? ((page - 1) * 10) : 0
  });

  if( articles ) {
    res.status(200).json(articles);
  } else {
    res.status(404).end();
  }
}));

// GET finds and sends back specific articles by query
router.get('/query', asyncHandler(async (req, res) => {
  const { query, page } = req.query;
  const articles = await Article.findAll({
    attributes: ['id', 'title', 'topic', 'intro', 'body', 'tags', 'userId', 'topicId', 'published', 'credits'], 
    include: [{ model: User, attributes: ['firstName', 'lastName', 'emailAddress']}],
    where: { 
      [Op.or]: [
        { title: { [Op.substring]: query } },
        { topic: { [Op.substring]: query } },
        { intro: { [Op.substring]: query } },
        { body:  { [Op.substring]: query } },
        { tags:  { [Op.substring]: query } }
      ]
    },
    limit: 10,
    offset: page !== 0 ? ((page - 1) * 10) : 0
  });

  if( articles ) {
    res.status(200).json(articles);
  } else {
    res.status(404).end();
  }
}));

// GET gets articles by researchers the user follow (sorted by most recent)
router.get('/following', authenticateLogin, asyncHandler(async (req, res) => {
  const { page } = req.query;
  const user = await User.findOne({ where: { emailAddress: req.currentUser.emailAddress }});
  const following = isStringAndStringToArray(user.following);

  const articles = await Article.findAll({
    attributes: ['id', 'title', 'topic', 'intro', 'body', 'tags', 'userId', 'topicId', 'published', 'credits'], 
    include: [{ model: User, attributes: ['firstName', 'lastName']}],
    where: { userId: { [Op.in]: following } },
    order: [['published', 'DESC']],
    limit: 10,
    offset: page !== 0 ? ((page - 1) * 10) : 0
  });

  if( articles ) {
    res.status(200).json(articles);
  } else {
    res.status(404).end();
  }
}));

// GET finds specified article and basic info on its owner
router.get('/', asyncHandler(async (req, res) => {
  const { id } = req.query;
  const article = await Article.findByPk( id, { 
    attributes: ['id', 'title', 'topic', 'intro', 'body', 'tags', 'userId', 'published', 'credits'], 
    include: [ { model: User, attributes: { exclude: ['emailAddress', 'password', 'createdAt', 'updatedAt'] } } ]
  });
  if (article) {
    res.status(200).json(article);
  } else {
    res.status(404).end();
  }
}));

// GET finds and displays all the articles and basic info on their owners
router.get('/owner', asyncHandler(async (req, res) => {
  const { id, page } = req.query;
  const articles = await Article.findAll({
    attributes: ['id', 'title', 'topic', 'intro', 'body', 'tags', 'userId', 'published', 'credits'], 
    include: [{ model: User, attributes: ['firstName', 'lastName', 'emailAddress', 'accessLevel']}],
    where: { userId: id },
    limit: 10,
    offset: page !== 0 ? ((page - 1) * 10) : 0
  });

  if (articles) {
    res.status(200).json(articles);
  } else {
    res.status(404).end();
  }
}));

// POST creates a new article and assigns the logged authenticated user as its owner
router.post('/', authenticateLogin, asyncHandler(async (req, res) => {
  req.body.userId = req.currentUser.id;
  const topic = await Topic.findOne({ where: { name: req.body.topic } });
  if (topic) {
    req.body.topicId = topic.id;
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } else {
    res.status(400).send(`Unable to find '${req.body.topic}'.`);
  }
}));

// POST creates a new article ( Admin Only Route )
router.post('/admin', authenticateLogin, asyncHandler(async (req, res) => {
  const isAdmin = req.currentUser.accessLevel === 'admin';
  if (isAdmin) {
    const topic = await Topic.findOne({ where: { name: req.body.topic } });
    if (topic) {
      req.body.topicId = topic.id;
      const article = await Article.create(req.body);
      res.status(201).json(article);
    } else {
      res.status(400).send(`Unable to find '${req.body.topic}'.`);
    }
  } else {
    res.status(403).end();
  }
}));

// PUT updates the chosen article if the user is authenticated to do so
router.put('/', authenticateLogin, asyncHandler(async (req, res) => {
  const article = await Article.findOne({ where: { id: req.query.id } });
  const owner = await User.findOne({ where: { id: article.userId }});

  const isOwner = owner.emailAddress === req.currentUser.emailAddress;
  const isAdmin = req.currentUser.accessLevel === 'admin';

  if (isOwner || isAdmin) {
    await Article.update(req.body, { where: { id: req.query.id } })
      .then(response => {
        if (!response.name) {
          res.status(204).end()
        }
      });
  } else {
    res.status(403).end();
  }
}));

// PUT updates an articles credits (accredits or discredits article) 
router.put('/credit', authenticateLogin, asyncHandler(async (req, res) => {
  const article = await Article.findOne({ where: { id: req.query.id } });
  const creditor = await User.findOne({ where: {emailAddress: req.currentUser.emailAddress} });

  const accreditedArticles = isStringAndStringToArray(creditor.accreditedArticles);
  const alreadyAccredited = accreditedArticles.includes(article.id.toString());

  const discreditedArticles = isStringAndStringToArray(creditor.discreditedArticles);
  const alreadyDiscredited = discreditedArticles.includes(article.id.toString());
  
  const isAccrediting = req.body.credit === 'accredit';

  let updatedCredits;
  if (isAccrediting && alreadyDiscredited) {
    updatedCredits = article.credits + 2 
  } else if (isAccrediting && !alreadyAccredited) {
    updatedCredits = article.credits + 1 
  } else if (!isAccrediting && alreadyDiscredited) {
    updatedCredits = article.credits + 1 
  } else if (isAccrediting && alreadyAccredited) {
    updatedCredits = article.credits - 1 
  } else if (!isAccrediting && !alreadyAccredited) {
    updatedCredits = article.credits - 1 
  } else if (!isAccrediting && alreadyAccredited) {
    updatedCredits = article.credits - 2 
  }

  if (article) {
    await Article.update(
      { credits: updatedCredits }, 
      { where: { id: req.query.id } })
      .then( async (response) => {
        if (!response.name) {
          let updatedAccreditedArticles;
          let updatedDiscreditedArticles;

          if (isAccrediting && !alreadyAccredited) {
            updatedAccreditedArticles = [...accreditedArticles, article.id.toString()];
          } else if (isAccrediting && alreadyAccredited) {
            updatedAccreditedArticles = accreditedArticles.filter( id => id !== article.id.toString());
          } else if (!isAccrediting && alreadyAccredited) {
            updatedAccreditedArticles = accreditedArticles.filter( id => id !== article.id.toString());
          }

          if (!isAccrediting && !alreadyDiscredited) {
            updatedDiscreditedArticles = [...discreditedArticles, article.id.toString()];
          } else if (!isAccrediting && alreadyDiscredited) {
            updatedDiscreditedArticles = discreditedArticles.filter( id => id !== article.id.toString());
          } else if (isAccrediting && alreadyDiscredited) {
            updatedDiscreditedArticles = discreditedArticles.filter( id => id !== article.id.toString());
          }

          await User.update(
            { 
              accreditedArticles: updatedAccreditedArticles,
              discreditedArticles: updatedDiscreditedArticles 
            },
            { where: { id: creditor.id } })
            .then( async (response) => {
              if (!response.name) {
                const updatedUser = await User.findOne({ 
                  attributes: { exclude: ['password', 'createdAt'] }, 
                  where: { emailAddress: req.currentUser.emailAddress } 
                });
                const updatedArticle = await Article.findOne({ 
                  where: { id: req.query.id } 
                });
                res.status(200).json({ user: updatedUser, article: updatedArticle });
              }
            });
        }
      });
  } else {
    res.status(403).end();
  }
}));

// DELETE deletes the chosen article if the user is authenticated to do so
router.delete('/', authenticateLogin, asyncHandler(async (req, res) => {
  const article = await Article.findOne({ where: { id: req.query.id } });
  const owner = await User.findOne({ where: { id: article.userId }});
  
  const isOwner = owner.emailAddress === req.currentUser.emailAddress;
  const isAdmin = req.currentUser.accessLevel === 'admin';

  if (isOwner || isAdmin) {
    await Article.destroy({ where: { id: req.query.id } })
      .then(res.status(204).end());
  } else {
    res.status(403).end();
  }
}));

module.exports = router;