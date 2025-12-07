const express = require('express');
const router = express.Router();
const spendingController = require('../controllers/spendingController');
const { smartAuthenticate } = require('../middleware/auth');

// All spending routes require authentication (smart: dev or JWT)
// User can only access their own spending data

// POST / - Create new spending
router.post('/', smartAuthenticate, spendingController.createSpending);

// GET / - Get all user's spendings
router.get('/', smartAuthenticate, spendingController.getAllSpendings);

// GET /:id - Get specific spending (user's own)
router.get('/:id', smartAuthenticate, spendingController.getSpendingById);

// PUT /:id - Update spending (user's own)
router.put('/:id', smartAuthenticate, spendingController.updateSpending);

// DELETE /:id - Delete spending (user's own)
router.delete('/:id', smartAuthenticate, spendingController.deleteSpending);

module.exports = router;