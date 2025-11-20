const express = require('express');
const router = express.Router();
const spendingController = require('../controllers/spendingController');

// Here id refers to spendiong object ID and not user ID.

// POST /
router.post('/', spendingController.createSpending);

// GET /
router.get('/', spendingController.getAllSpendings);

// GET /:id (this is spending id)
router.get('/:id', spendingController.getSpendingById);

// PUT /:id
router.put('/:id', spendingController.updateSpending);

// DELETE /:id
router.delete('/:id', spendingController.deleteSpending);

module.exports = router;