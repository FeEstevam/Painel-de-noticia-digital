const express = require('express');
const FeedController = require('../controller/feedController');

const router = express.Router();

// GET /api/feed/general?category=geral
router.get('/general', FeedController.getGeneralNews);

// GET /api/feed/g1 (Feed RSS Oficial do G1 / Globo)
router.get('/g1', FeedController.getG1News);

// GET /api/feed/categories
router.get('/categories', FeedController.getCategories);

module.exports = router;

