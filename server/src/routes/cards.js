// server/src/routes/cards.js
const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// POST /api/cards
router.post('/', cardController.createCard);

// GET /api/cards
router.get('/', cardController.getAllCards);

// GET /api/cards/:id
router.get('/:id', cardController.getCardById);

// PUT /api/cards/:id
router.put('/:id', cardController.updateCard);

// DELETE /api/cards/:id
router.delete('/:id', cardController.deleteCard);

module.exports = router;
