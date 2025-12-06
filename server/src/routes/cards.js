const express = require('express');
const router = express.Router();

// ✅ use RELATIVE path and correct spelling: cardController
const cardController = require('../controllers/cardController.js');

// GET /api/cards
router.get('/', cardController.getAllCards);

module.exports = router;
