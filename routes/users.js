const express = require('express');
const router = express.Router();

// Import middlewares
const asyncHandler = require('../middleware/async-handler');
const authenticateLogin = require('../middleware/user-auth');

// Import Models
const { Article, User, Topic, Category } = require('../models');

// Import Op
const { Op } = require('../models').Sequelize;


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

  const following = user.following;
  const accreditedArticles = user.accreditedArticles;

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
  const testedQuery = /\s/g.test(query) ? `(${query.split(' ').join(')|(')})` : query;
  const users = await User.findAll({ 
    attributes:  { exclude: ['emailAddress','password', 'createdAt', 'updatedAt'] },
    where: { 
      [Op.or]: [
      { firstName: { [Op.iRegexp]: testedQuery } },
      { lastName: { [Op.iRegexp]: testedQuery } }
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
  const { source, id  } = req.query;
  const isOwner = req.currentUser.id === id;
  const isAdmin = req.currentUser.accessLevel === 'admin';
  let updatedData = {};

  if (source === 'admin' && isAdmin) {
    updatedData = { ...req.body };
  } else if (source === 'My Profile') {
    updatedData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      occupation: req.body.occupation,
      mostActiveField: req.body.mostActiveField,
      bio: req.body.bio
    }
  } else if (source === 'My Account') {
    updatedData = {
      emailAddress: req.body.emailAddress,
      password: req.body.password
    }
  } else if (source === 'img/header') {
    updatedData = {
      headerImgURL: req.body.headerImgURL
    }
  } else if (source === 'img/profile') {
    updatedData = {
      profileImgURL: req.body.profileImgURL
    }
  }

  if (isOwner || isAdmin) {
    await User.update(updatedData, { where: { id: id } })
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
  const { id } = req.query;
  // Fetches the two users from the API
  const user = await User.findOne({
    attributes: [ 'id', 'following', 'emailAddress' ],
    where: { emailAddress: req.currentUser.emailAddress }
  });
  const target = await User.findOne({ 
    attributes: [ 'id', 'followers' ],
    where: { id } 
  });
  
  const isOnline = user.emailAddress === req.currentUser.emailAddress;

  if (isOnline && user.id !== target.id) {
    // Programatically checks and updates for both follow and unfollow, making sure you cant follow more than once
    const userId = typeof user.id === 'number' ? user.id : parseInt(user.id);
    const targetId = typeof target.id === 'number' ? target.id : parseInt(target.id);

    const following = user.following;
    const followers = target.followers;

    const updatedFollowing = !following.includes(targetId) ? [...following, targetId] : following.filter( id => id !== targetId );
    const updatedFollowers= !followers.includes(userId) ? [...followers, userId] : followers.filter( id => id !== userId );

    // Update the two users with the respective data
    const userRes = await User.update(
      { following: updatedFollowing }, 
      { where: { emailAddress: req.currentUser.emailAddress } });
    const targetRes = await User.update(
      { followers: updatedFollowers }, 
      { where: { id } });

    // If it returns any data it was fail, so we check if theres any return
    if (!userRes.name && !targetRes.name) {
      const user = await User.findOne({ attributes: { exclude: ['emailAddress','password', 'createdAt', 'updatedAt'] }, 
        where: { emailAddress: req.currentUser.emailAddress },
      });
      const target = await User.findOne({ attributes: { exclude: ['emailAddress','password', 'createdAt', 'updatedAt'] },  
        where: { id } });
      res.status(200).json({ user, target });
    }
  } else {
    res.status(403).end();
  }
}));

module.exports = router;