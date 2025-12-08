// server/src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { smartAuthenticate } = require('../middleware/auth');

// POST /api/users/register - Public route
router.post('/register', userController.register);

// POST /api/users/login - Public route (supports both traditional and Firebase login)
router.post('/login', userController.login);

// PATCH /api/users/:id/owned-cards - Protected route (smart: dev or JWT)
router.patch('/:id/owned-cards', smartAuthenticate, userController.updateOwnedCards);

// GET /api/users/me - Get current user info (smart: dev or JWT)
router.get('/me', smartAuthenticate, userController.getCurrentUser);

// GET /api/users/:id/investment-simulations - Estimate savings and investments
router.get('/:id/investment-simulations', smartAuthenticate, userController.getInvestmentSimulation);

module.exports = router;
