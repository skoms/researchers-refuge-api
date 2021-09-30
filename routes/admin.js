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

// GET finds and sends back a specific articles by tag
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

module.exports = router;