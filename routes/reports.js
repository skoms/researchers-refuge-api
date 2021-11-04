const express = require('express')
const router = express.Router()

const moment = require('moment')

// Import middlewares
const asyncHandler = require('../middleware/async-handler')
const authenticateLogin = require('../middleware/user-auth')

// Import Models
const { Article, User, Topic, Category, Report } = require('../models')

// Import Op
const { Op } = require('../models').Sequelize

// redirects users
router.get('/', (req, res) => {
	res
		.status(403)
		.json({
			message:
				'Reports can only be accessed with the correct authorization and through its designated admin route',
		})
})

// Post a new report to the DB
router.post(
	'/',
	authenticateLogin,
	asyncHandler(async (req, res) => {
		const reportBody = {
			title: req.body.title,
			description: req.body.description,
			userId: req.body.userId || req.currentUser.id,
		}
		await Report.create(reportBody)
		res.status(204).end()
	})
)

module.exports = router
