const express = require('express');
const router = express.Router();

// ✅ use RELATIVE path and correct spelling: cardController
const cardController = require('../controllers/cardController.js');

// GET /api/cards - Get all cards
router.get('/', cardController.getAllCards);

// GET /api/cards/:id - Get card by ID
router.get('/:id', cardController.getCardById);

// POST /api/cards - Create new card
router.post('/', cardController.createCard);

// PUT /api/cards/:id - Update card
router.put('/:id', cardController.updateCard);

// DELETE /api/cards/:id - Delete card
router.delete('/:id', cardController.deleteCard);

module.exports = router;
