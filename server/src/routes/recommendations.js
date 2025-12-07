// server/src/routes/recommendations.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { smartAuthenticate } = require('../middleware/auth');

// Best card per category among authenticated user's owned cards (smart: dev or JWT)
router.get('/my-cards', smartAuthenticate, recommendationController.getBestForUserCards);

// Global ranking of all cards (public route)
router.get('/global', recommendationController.getGlobalRanking);

module.exports = router;
