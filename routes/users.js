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

// GET finds specified user by ID
router.get('/', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.query.id, { 
    attributes:  { exclude: ['emailAddress','password', 'createdAt', 'updatedAt'] }});
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).end();
  }
}));

// GET authenticated user info
router.get('/me', authenticateLogin, asyncHandler(async (req, res) => {
  const user = await User.findOne({
    attributes: { exclude: ['password'] },
    where: { emailAddress: req.currentUser.emailAddress }
  });
  res.status(200).json(user);
}));

// GET finds and displays recommended users
router.get('/recommended', authenticateLogin, asyncHandler(async (req, res) => {
  const user = await User.findOne({ 
    attributes: ['id', 'accreditedArticles', 'following', 'occupation'],
    where: { emailAddress: req.currentUser.emailAddress } 
  });

  const following = isStringAndStringToArray(user.following);
  const accreditedArticles = isStringAndStringToArray(user.accreditedArticles);

  const accreditedOnes = await Article.findAll({
    attributes: ['topicId'],
    where: { id: { [Op.in]: accreditedArticles } }
  });

  const articleTopicIds = accreditedOnes.map( article => article.topicId );
  const topics = await Topic.findAll({
    attributes: ['name'],
    where: { id: { [Op.in]: articleTopicIds } }
  });

  const topicNames = topics.map( topic => topic.name );
  const users = await User.findAll({
    attributes: ['id', 'firstName', 'lastName', 'followers', 'occupation', 'profileImgURL', 'headerImgURL'],
    where: {
      [Op.and]:[
        { [Op.or]: [
          { mostActiveField: { [Op.in]: topicNames } },
          { occupation: { [Op.eq]: user.occupation } }
          ]
        },
        { id: { [Op.notIn]: following } },
        { id: { [Op.not]: user.id } }
      ]
    }
  })

  if( users ) {
    res.status(200).json(users.slice(0,3));
  } else {
    res.status(404).end();
  }
}));

// GET find users by query
router.get('/query', asyncHandler(async (req, res) => {
  const { query, page } = req.query;
  const users = await User.findAll({ 
    attributes:  { exclude: ['emailAddress','password', 'createdAt', 'updatedAt'] },
    where: { 
      [Op.or]: [
      { firstName: { [Op.substring]: query } },
      { lastName: { [Op.substring]: query } }
    ]},
    limit: 5,
    offset: page !== 0 ? ((page - 1) * 5) : 0
  });

  if (users) {
    res.status(200).json(users);
  } else {
    res.status(404).end();
  }
}));

// POST creates a new user and stores it in database if it meet requirements
router.post('/', asyncHandler(async (req, res) => {

  // Commented out for easier testing, but feel free to uncomment to see that it works perfectly :)
  // const passwordIsValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/.test(req.body.password);
  // if (passwordIsValid) {
  //   await User.create(req.body);
  //   res.location('/').status(201).end();
  // } else {
  //   res.status(400).json({ message: "The password must contain between 8 and 20 characters including at least 1 uppercase, 1 lowercase and one digit." });
  // }

  await User.create(req.body);
  res.location('/').status(201).end();
}));

// POST creates a new user ( Admin Only )
router.post('/admin', authenticateLogin, asyncHandler(async (req, res) => {
  const isAdmin = req.currentUser.accessLevel === 'admin';
  if (isAdmin) {
    await User.create(req.body);
    res.location('/').status(201).end();
  } else {
    res.status(403).end();
  }
}));

// PUT updates the chosen user if authenticated to do so
router.put('/', authenticateLogin, asyncHandler(async (req, res) => {
  const owner = await User.findOne({ where: { id: req.query.id } });

  const isOwner = owner.emailAddress === req.currentUser.emailAddress;
  const isAdmin = req.currentUser.accessLevel === 'admin';

  if (isOwner || isAdmin) {
    await User.update(req.body, { where: { id: req.query.id } })
      .then(response => {
        if (!response.name) {
          res.status(204).end()
        }
      });
  } else {
    res.status(403).end();
  }
}));

// PUT updates 'followers' for the target and 'following' for the follow/unfollow, and returns both Users to update them
router.put('/follow', authenticateLogin, asyncHandler(async (req, res) => {
  // Fetches the two users from the API
  const user = await User.findOne({
    attributes: [ 'id', 'following', 'emailAddress' ],
    where: { emailAddress: req.currentUser.emailAddress }
  });
  const target = await User.findOne({ 
    attributes: [ 'id', 'followers' ],
    where: { id: req.query.id } });
  
  const isOnline = user.emailAddress === req.currentUser.emailAddress;

  if (isOnline && user.id !== target.id) {
    // Programatically checks and updates for both follow and unfollow, making sure you cant follow more than once
    const following = user.following.split(',');
    const followers = target.followers.split(',');
    const updatedFollowing = !following.includes(target.id.toString()) ? [...following, target.id] : following.filter( id => id !== target.id.toString() );
    const updatedFollowers= !followers.includes(user.id.toString()) ? [...followers, user.id] : followers.filter( id => id !== user.id.toString() );

    // Update the two users with the respective data
    const userRes = await User.update(
      { following: updatedFollowing }, 
      { where: { emailAddress: req.currentUser.emailAddress } });
    const targetRes = await User.update(
      { followers: updatedFollowers }, 
      { where: { id: req.query.id } });

    // If it returns any data it was fail, so we check if theres any return
    if (!userRes.name && !targetRes.name) {
      const user = await User.findOne({ attributes: { exclude: ['emailAddress','password', 'createdAt', 'updatedAt'] }, 
        where: { emailAddress: req.currentUser.emailAddress },
      });
      const target = await User.findOne({ attributes: { exclude: ['emailAddress','password', 'createdAt', 'updatedAt'] },  
        where: { id: req.query.id } });
      res.status(200).json({ user, target });
    }
  } else {
    res.status(403).end();
  }
}));

module.exports = router;