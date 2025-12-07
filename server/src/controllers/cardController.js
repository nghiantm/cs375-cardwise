// server/src/controllers/cardController.js
const Card = require('../models/Card');

// POST /api/cards
exports.createCard = async (req, res, next) => {
  try {
    const {
      card_id,
      card_name,
      card_type,
      bank_id,
      img_url,
      annual_fee,
    } = req.body;

    if (!card_id || !card_name || !bank_id || !card_type) {
      return res.status(400).json({
        success: false,
        message: 'card_id, card_name, bank_id, and card_type are required',
      });
    }

    const newCard = await Card.create({
      card_id,
      card_name,
      card_type,
      bank_id,
      img_url,
      annual_fee,
    });

    return res.status(201).json({
      success: true,
      message: 'Card created successfully',
      data: newCard,
    });
  } catch (error) {
    // handle duplicate card_id
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Card with this card_id already exists',
      });
    }
    next(error);
  }
};

// GET /api/cards
exports.getAllCards = async (req, res, next) => {
  try {
    const { bank_id, card_type } = req.query;
    const filter = {};

    if (bank_id) filter.bank_id = bank_id;
    if (card_type) filter.card_type = card_type;

    const cards = await Card.find(filter).sort({ bank_id: 1, card_name: 1 });

    return res.status(200).json({
      success: true,
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cards/:id
exports.getCardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cards/:id
exports.updateCard = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await Card.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Card updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cards/:id
exports.deleteCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Card.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
