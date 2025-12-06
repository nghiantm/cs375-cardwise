// server/src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/register
router.post('/register', userController.register);

// POST /api/users/login
router.post('/login', userController.login);

// PATCH /api/users/:id/owned-cards
router.patch('/:id/owned-cards', userController.updateOwnedCards);

module.exports = router;
