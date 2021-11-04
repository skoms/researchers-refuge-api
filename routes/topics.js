const express = require('express')
const router = express.Router()
const moment = require('moment')

// Import middleware
const asyncHandler = require('../middleware/async-handler')
const authenticateLogin = require('../middleware/user-auth')

// Import Models
const { Article, User, Topic, Category } = require('../models')

// Import Op
const { Op } = require('../models').Sequelize

const articleLimit = 5

// GET finds and displays all topics
router.get(
	'/',
	asyncHandler(async (req, res) => {
		const topics = await Topic.findAll({
			attributes: ['id', 'name', 'relatedTags', 'categoryId'],
		})

		res.status(200).json(topics)
	})
)

// GET finds and sends back a specific topics by tag
router.get(
	'/tag',
	asyncHandler(async (req, res) => {
		const { tag } = req.query
		const topics = await Topic.findAll({
			attributes: ['id', 'name', 'relatedTags', 'categoryId'],
			where: { relatedTags: { [Op.contains]: [tag] } },
		})

		if (topics) {
			res.status(200).json(topics)
		} else {
			res.status(404).end()
		}
	})
)

// GET finds and sends back specific topics by query
router.get(
	'/query',
	asyncHandler(async (req, res) => {
		const { query } = req.query
		const topics = await Topic.findAll({
			attributes: ['id', 'name', 'relatedTags', 'categoryId'],
			where: {
				[Op.or]: [
					{ name: { [Op.iRegexp]: query } },
					{ relatedTags: { [Op.contains]: [query] } },
				],
			},
		})

		if (topics) {
			res.status(200).json(topics)
		} else {
			res.status(404).end()
		}
	})
)

// GET finds and displays a specific topic by name
router.get(
	'/name',
	asyncHandler(async (req, res) => {
		try {
			const { name, filter, page } = req.query
			let topic
			let count

			if (filter === 'top') {
				topic = await Topic.findOne({
					attributes: ['id', 'name', 'relatedTags', 'categoryId'],
					where: { name: name },
					include: [
						{
							model: Article,
							attributes: { exclude: ['createdAt', 'updatedAt'] },
							include: [{ model: User, attributes: ['firstName', 'lastName'] }],
							order: [['credits', 'DESC']],
							limit: articleLimit,
							offset: page !== 0 ? (page - 1) * articleLimit : 0,
						},
					],
				})
				count = await Article.count({ where: { topicId: topic.id } })
			} else if (filter === 'new') {
				topic = await Topic.findOne({
					attributes: ['id', 'name', 'relatedTags', 'categoryId'],
					where: { name: name },
					include: [
						{
							model: Article,
							attributes: { exclude: ['createdAt', 'updatedAt'] },
							include: [{ model: User, attributes: ['firstName', 'lastName'] }],
							order: [['published', 'DESC']],
							limit: articleLimit,
							offset: page !== 0 ? (page - 1) * articleLimit : 0,
						},
					],
				})
				count = await Article.count({ where: { topicId: topic.id } })
			} else if (filter === 'popular') {
				const aMonthAgo = moment([
					moment().year(),
					moment().month() - 1,
					moment().date(),
				]).format('YYYY-MM-DD')

				topic = await Topic.findOne({
					attributes: ['id', 'name', 'relatedTags', 'categoryId'],
					where: { name: name },
					include: [
						{
							model: Article,
							attributes: { exclude: ['createdAt', 'updatedAt'] },
							include: [{ model: User, attributes: ['firstName', 'lastName'] }],
							order: [['credits', 'DESC']],
							where: { published: { [Op.gte]: aMonthAgo } },
							limit: articleLimit,
							offset: page !== 0 ? (page - 1) * articleLimit : 0,
						},
					],
				})

				count = await Article.count({
					where: {
						[Op.and]: [
							{ published: { [Op.gte]: aMonthAgo } },
							{ topicId: topic.id },
						],
					},
				})
			} else {
				topic = await Topic.findOne({
					attributes: ['id', 'name', 'relatedTags', 'categoryId'],
					where: { name: name },
					include: [
						{
							model: Article,
							attributes: { exclude: ['createdAt', 'updatedAt'] },
							include: [{ model: User, attributes: ['firstName', 'lastName'] }],
							limit: articleLimit,
							offset: page !== 0 ? (page - 1) * articleLimit : 0,
						},
					],
				})
				count = await Article.count({ where: { topicId: topic.id } })
			}
			const hasMore = count - page * articleLimit > 0
			const lastPage = Math.ceil(count / articleLimit)

			if (topic) {
				res.status(200).json({ topic, hasMore, lastPage })
			} else {
				res.status(404).end()
			}
		} catch (error) {
			console.log(error)
		}
	})
)

// GET finds and displays a specific topic by ID
router.get(
	'/id',
	asyncHandler(async (req, res) => {
		const topic = await Topic.findByPk(req.query.id, {
			attributes: ['id', 'name', 'relatedTags', 'categoryId'],
		})

		if (topic) {
			res.status(200).json(topic)
		} else {
			res.status(404).end()
		}
	})
)

// GET finds and displays recommended topics
router.get(
	'/recommended',
	authenticateLogin,
	asyncHandler(async (req, res) => {
		const user = await User.findOne({
			attributes: ['accreditedArticles'],
			where: { emailAddress: req.currentUser.emailAddress },
		})
		const articles = await Article.findAll({
			attributes: ['topicId'],
			where: { id: { [Op.in]: user.accreditedArticles } },
		})
		const articleTopicIds = articles.map((article) => article.topicId)
		const topics = await Topic.findAll({
			attributes: ['id', 'name'],
			where: { id: { [Op.in]: articleTopicIds } },
		})

		if (topics) {
			res.status(200).json(topics.slice(0, 3))
		} else {
			res.status(404).end()
		}
	})
)

module.exports = router
