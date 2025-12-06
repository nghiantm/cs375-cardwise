// server/src/routes/recommendations.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Best card per category among user's owned cards
router.get('/my-cards', recommendationController.getBestForUserCards);

// Global ranking of all cards
router.get('/global', recommendationController.getGlobalRanking);

module.exports = router;
