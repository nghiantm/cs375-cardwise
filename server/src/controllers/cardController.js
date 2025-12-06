// server/src/controllers/cardController.js
const Card = require('../models/Card');

// GET /api/cards
exports.getAllCards = async (req, res, next) => {
  try {
    const cards = await Card.find().sort({ bank_id: 1, card_name: 1 });

    res.status(200).json({
      success: true,
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};
