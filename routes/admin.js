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

// GET gets all the statistics on row count in needed tables
router.get('/stats', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const totalUsers = await User.count();
    const totalArticles = await Article.count(); 
    const totalAdmins = await User.count({ where: { accessLevel: 'admin' }});

    const aMonthAgo = moment([ moment().year(), moment().month() - 1, moment().date()]).format('YYYY-MM-DD');

    const newUsers = await User.count({ where: { createdAt: { [Op.gte]: aMonthAgo } } });
    const newArticles = await Article.count({ where: { createdAt: { [Op.gte]: aMonthAgo } } });
    const newAdmins = await User.count({ where: { 
        [Op.and]: [
          { createdAt: { [Op.gte]: aMonthAgo } },
          { accessLevel: 'admin' }
        ]
      } 
    });

    const totalOpen = await Report.count({ where: { status: 'open' } });
    const totalResolved = await Report.count({ where: { status: 'resolved' } });
    const totalRejected = await Report.count({ where: { status: 'rejected' } });

    res.status(200).json({ 
      total: {
        users: totalUsers,
        articles: totalArticles,
        admins: totalAdmins
      },  
      new: {
        users: newUsers,
        articles: newArticles,
        admins: newAdmins
      },
      reports: {
        open: totalOpen,
        resolved: totalResolved,
        rejected: totalRejected
      }
    });
  } else {
    res.status(403).end();
  }
}));

// GET gets all the users (and sorts if selected)
router.get('/users', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const { limit, page, sortColumn, sortOrder } = req.query;
    const users = await User.findAll({ 
      attributes:  { exclude: ['password'] },
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await User.count();
    
    const hasMore = (count - (page * limit)) > 0;
    const lastPage = Math.ceil(count / limit);

    const rangeStart = (
      parseInt(page) === 1 ?
        1 : 
        (page - 1) * limit + 1
    );
    const rangeEnd = (
      parseInt(page) === 1 ? 
        users.indexOf( users[users.length - 1] ) + 1 : 
        users.indexOf( users[users.length - 1] )+ (limit * (page - 1)) + 1 
    );

    res.status(200).json({users, hasMore, lastPage, count, rangeStart, rangeEnd});
  } else {
    res.status(403).end();
  }
}));

// GET gets all the users (and sorts if selected) based on search query
router.get('/users/search', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const { limit, page, sortColumn, sortOrder, query } = req.query;
    const users = await User.findAll({ 
      attributes:  { exclude: ['password'] },
      where: { 
        [Op.or]: [
        { firstName: { [Op.substring]: query } },
        { lastName: { [Op.substring]: query } },
        { emailAddress: { [Op.substring]: query } },
        { accessLevel: { [Op.substring]: query } },
        { id: (parseInt(query) ? parseInt(query) : 0) }
      ]},
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await User.count();
    
    const hasMore = (count - (page * limit)) > 0;
    const lastPage = Math.ceil(count / limit);

    const rangeStart = (
      parseInt(page) === 1 ?
        1 : 
        (page - 1) * limit + 1
    );
    const rangeEnd = (
      parseInt(page) === 1 ? 
        users.indexOf( users[users.length - 1] ) + 1 : 
        users.indexOf( users[users.length - 1] )+ (limit * (page - 1)) + 1 
    );

    res.status(200).json({users, hasMore, lastPage, count, rangeStart, rangeEnd});
  } else {
    res.status(403).end();
  }
}));

module.exports = router;