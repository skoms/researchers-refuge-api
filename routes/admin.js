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
        ]
      },
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await User.count({
      where: { 
        [Op.or]: [
          { firstName: { [Op.substring]: query } },
          { lastName: { [Op.substring]: query } },
          { emailAddress: { [Op.substring]: query } },
          { accessLevel: { [Op.substring]: query } },
          { id: (parseInt(query) ? parseInt(query) : 0) }
        ]
      }
    });
    
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

// GET gets all the articles (and sorts if selected)
router.get('/articles', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const { limit, page, sortColumn, sortOrder } = req.query;
    const articles = await Article.findAll({ 
      include: [{ model: User, attributes: ['firstName', 'lastName'] }],
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await Article.count();
    
    const hasMore = (count - (page * limit)) > 0;
    const lastPage = Math.ceil(count / limit);

    const rangeStart = (
      parseInt(page) === 1 ?
        1 : 
        (page - 1) * limit + 1
    );
    const rangeEnd = (
      parseInt(page) === 1 ? 
        articles.indexOf( articles[articles.length - 1] ) + 1 : 
        articles.indexOf( articles[articles.length - 1] )+ (limit * (page - 1)) + 1 
    );

    res.status(200).json({articles, hasMore, lastPage, count, rangeStart, rangeEnd});
  } else {
    res.status(403).end();
  }
}));

// GET gets all the articles (and sorts if selected) based on search query
router.get('/articles/search', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const { limit, page, sortColumn, sortOrder, query } = req.query;
    const articles = await Article.findAll({ 
      where: { 
        [Op.or]: [
          { title: { [Op.substring]: query } },
          { topic: { [Op.substring]: query } },
          { intro: { [Op.substring]: query } },
          { body: { [Op.substring]: query } },
          { id: (parseInt(query) ? parseInt(query) : 0) },
          { userId: (parseInt(query) ? parseInt(query) : 0) }
        ]
      },
      include: [{ model: User, attributes: ['firstName', 'lastName'] }],
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await Article.count({
      where: { 
        [Op.or]: [
          { title: { [Op.substring]: query } },
          { topic: { [Op.substring]: query } },
          { intro: { [Op.substring]: query } },
          { body: { [Op.substring]: query } },
          { id: (parseInt(query) ? parseInt(query) : 0) },
          { userId: (parseInt(query) ? parseInt(query) : 0) }
        ]
      }
    });
    
    const hasMore = (count - (page * limit)) > 0;
    const lastPage = Math.ceil(count / limit);

    const rangeStart = (
      parseInt(page) === 1 ?
        1 : 
        (page - 1) * limit + 1
    );
    const rangeEnd = (
      parseInt(page) === 1 ? 
        articles.indexOf( articles[articles.length - 1] ) + 1 : 
        articles.indexOf( articles[articles.length - 1] )+ (limit * (page - 1)) + 1 
    );

    res.status(200).json({articles, hasMore, lastPage, count, rangeStart, rangeEnd});
  } else {
    res.status(403).end();
  }
}));

// GET gets all the topics (and sorts if selected)
router.get('/topics', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const { limit, page, sortColumn, sortOrder } = req.query;
    const topics = await Topic.findAll({ 
      include: [{ model: Category, attributes: ['name'] }],
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await Topic.count();
    
    const hasMore = (count - (page * limit)) > 0;
    const lastPage = Math.ceil(count / limit);

    const rangeStart = (
      parseInt(page) === 1 ?
        1 : 
        (page - 1) * limit + 1
    );
    const rangeEnd = (
      parseInt(page) === 1 ? 
        topics.indexOf( topics[topics.length - 1] ) + 1 : 
        topics.indexOf( topics[topics.length - 1] )+ (limit * (page - 1)) + 1 
    );

    res.status(200).json({topics, hasMore, lastPage, count, rangeStart, rangeEnd});
  } else {
    res.status(403).end();
  }
}));

// GET gets all the topics (and sorts if selected) based on search query
router.get('/topics/search', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const { limit, page, sortColumn, sortOrder, query } = req.query;
    const topics = await Topic.findAll({ 
      where: { 
        [Op.or]: [
          { name: { [Op.substring]: query } },
          { relatedTags: { [Op.contains]: [query] } },
          { id: (parseInt(query) ? parseInt(query) : 0) },
          { categoryId: (parseInt(query) ? parseInt(query) : 0) }
        ]
      },
      include: [{ model: Category, attributes: ['name'] }],
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await Topic.count({
      where: { 
        [Op.or]: [
          { name: { [Op.substring]: query } },
          { relatedTags: { [Op.contains]: [query] } },
          { id: (parseInt(query) ? parseInt(query) : 0) },
          { categoryId: (parseInt(query) ? parseInt(query) : 0) }
        ]
      }
    });
    
    const hasMore = (count - (page * limit)) > 0;
    const lastPage = Math.ceil(count / limit);

    const rangeStart = (
      parseInt(page) === 1 ?
        1 : 
        (page - 1) * limit + 1
    );
    const rangeEnd = (
      parseInt(page) === 1 ? 
        topics.indexOf( topics[topics.length - 1] ) + 1 : 
        topics.indexOf( topics[topics.length - 1] )+ (limit * (page - 1)) + 1 
    );

    res.status(200).json({topics, hasMore, lastPage, count, rangeStart, rangeEnd});
  } else {
    res.status(403).end();
  }
}));

// GET gets all the categories (and sorts if selected)
router.get('/categories', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const { limit, page, sortColumn, sortOrder } = req.query;
    const categories = await Category.findAll({ 
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await Category.count();
    
    const hasMore = (count - (page * limit)) > 0;
    const lastPage = Math.ceil(count / limit);

    const rangeStart = (
      parseInt(page) === 1 ?
        1 : 
        (page - 1) * limit + 1
    );
    const rangeEnd = (
      parseInt(page) === 1 ? 
        categories.indexOf( categories[categories.length - 1] ) + 1 : 
        categories.indexOf( categories[categories.length - 1] )+ (limit * (page - 1)) + 1 
    );

    res.status(200).json({categories, hasMore, lastPage, count, rangeStart, rangeEnd});
  } else {
    res.status(403).end();
  }
}));

// GET gets all the categories (and sorts if selected) based on search query
router.get('/categories/search', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const { limit, page, sortColumn, sortOrder, query } = req.query;
    const categories = await Category.findAll({ 
      where: { 
        [Op.or]: [
          { name: { [Op.substring]: query } },
          { id: (parseInt(query) ? parseInt(query) : 0) }
        ]
      },
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await Category.count({
      where: { 
        [Op.or]: [
          { name: { [Op.substring]: query } },
          { id: (parseInt(query) ? parseInt(query) : 0) }
        ]
      }
    });
    
    const hasMore = (count - (page * limit)) > 0;
    const lastPage = Math.ceil(count / limit);

    const rangeStart = (
      parseInt(page) === 1 ?
        1 : 
        (page - 1) * limit + 1
    );
    const rangeEnd = (
      parseInt(page) === 1 ? 
        categories.indexOf( categories[categories.length - 1] ) + 1 : 
        categories.indexOf( categories[categories.length - 1] )+ (limit * (page - 1)) + 1 
    );

    res.status(200).json({categories, hasMore, lastPage, count, rangeStart, rangeEnd});
  } else {
    res.status(403).end();
  }
}));

// GET gets all the reports (and sorts if selected)
router.get('/reports', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const { status, limit, page, sortColumn, sortOrder } = req.query;
    const reports = await Report.findAll({ 
      where: { status: status },
      include: [{ model: User, attributes: ['firstName', 'lastName'] }],
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await Report.count({ where: { status: status } });
    
    const hasMore = (count - (page * limit)) > 0;
    const lastPage = Math.ceil(count / limit);

    const rangeStart = (
      parseInt(page) === 1 ?
        1 : 
        (page - 1) * limit + 1
    );
    const rangeEnd = (
      parseInt(page) === 1 ? 
        reports.indexOf( reports[reports.length - 1] ) + 1 : 
        reports.indexOf( reports[reports.length - 1] )+ (limit * (page - 1)) + 1 
    );

    res.status(200).json({reports, hasMore, lastPage, count, rangeStart, rangeEnd});
  } else {
    res.status(403).end();
  }
}));

// GET gets all the reports (and sorts if selected) based on search query
router.get('/reports/search', authenticateLogin, asyncHandler(async (req, res) => {
  if ( req.currentUser.accessLevel === 'admin' ) {
    const { status, limit, page, sortColumn, sortOrder, query } = req.query;
    const reports = await Report.findAll({ 
      where: { 
        [Op.and]: [
          { status: status },
          { [Op.or]: [
            { title: { [Op.substring]: query } },
            { description: { [Op.substring]: query } },
            { id: (parseInt(query) ? parseInt(query) : 0) },
            { userId: (parseInt(query) ? parseInt(query) : 0) }
          ]}
        ]
      },
      include: [{ model: User, attributes: ['firstName', 'lastName'] }],
      limit: limit,
      offset: page !== 0 ? ((page - 1) * limit) : 0,
      order: [[sortColumn, sortOrder]]
    });
    const count = await Report.count({
      where: { 
        [Op.and]: [
          { status: status },
          { [Op.or]: [
            { title: { [Op.substring]: query } },
            { description: { [Op.substring]: query } },
            { id: (parseInt(query) ? parseInt(query) : 0) },
            { userId: (parseInt(query) ? parseInt(query) : 0) }
          ]}
        ]
      }
    });
    
    const hasMore = (count - (page * limit)) > 0;
    const lastPage = Math.ceil(count / limit);

    const rangeStart = (
      parseInt(page) === 1 ?
        1 : 
        (page - 1) * limit + 1
    );
    const rangeEnd = (
      parseInt(page) === 1 ? 
        reports.indexOf( reports[reports.length - 1] ) + 1 : 
        reports.indexOf( reports[reports.length - 1] )+ (limit * (page - 1)) + 1 
    );

    res.status(200).json({reports, hasMore, lastPage, count, rangeStart, rangeEnd});
  } else {
    res.status(403).end();
  }
}));

module.exports = router;