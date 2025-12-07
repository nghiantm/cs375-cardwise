// server/src/controllers/spendingController.js
const Spending = require('../models/Spending');

exports.createSpending = async (req, res, next) => {
  // POST /api/spending
  // Create a new spending entry for authenticated user
  try {
    const { amount, category, date, merchant, notes, cardUsed, cardId } = req.body;

    // Validate required fields
    if (amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Amount and category are required',
      });
    }

    // Get userId from authenticated user (set by auth middleware)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const newSpending = await Spending.create({
      userId,
      amount,
      category,
      date,
      merchant,
      notes,
      cardUsed,
      cardId,
    });

    // Optionally populate related fields
    await newSpending.populate('userId', 'profile.firstName profile.lastName');
    await newSpending.populate('cardId', 'card_name bank_id');

    return res.status(201).json({
      id: newSpending._id,
      success: true,
      message: 'Spending entry created successfully',
      data: newSpending,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSpendings = async (req, res, next) => {
  // GET /api/spending
  // Get all spending entries for authenticated user
  try {
    // Get userId from authenticated user (set by auth middleware)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { category, startDate, endDate } = req.query; // Optional filters
    const filter = { userId };

    if (category) filter.category = category;

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate); // Greater than or equal
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate); // Less than or equal
      }
    }

    const spendings = await Spending.find(filter)
      .populate('userId', 'profile.firstName')
      .populate('cardId', 'card_name bank_id')
      .sort({ date: -1 }); // Newest first

    return res.status(200).json({
      success: true,
      count: spendings.length,
      data: spendings,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSpendingById = async (req, res, next) => {
  // GET /api/spending/:id
  // Get a specific spending entry (only if it belongs to authenticated user)
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const spending = await Spending.findOne({ _id: id, userId })
      .populate('userId', 'profile.firstName profile.lastName')
      .populate('cardId', 'card_name bank_id');

    if (!spending) {
      return res.status(404).json({
        success: false,
        message: 'Spending record not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: spending,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSpending = async (req, res, next) => {
  // PUT /api/spending/:id
  // Update a spending entry (only if it belongs to authenticated user)
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { amount, category, date, merchant, notes, cardUsed, cardId } = req.body;

    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (category) updateData.category = category;
    if (date) updateData.date = date;
    if (merchant !== undefined) updateData.merchant = merchant; // Allow clearing
    if (notes !== undefined) updateData.notes = notes;
    if (cardUsed !== undefined) updateData.cardUsed = cardUsed;
    if (cardId !== undefined) updateData.cardId = cardId;

    const updated = await Spending.findOneAndUpdate(
      { _id: id, userId }, // Only update if belongs to this user
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('userId', 'profile.firstName profile.lastName')
      .populate('cardId', 'card_name bank_id');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Spending record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Spending record updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSpending = async (req, res, next) => {
  // DELETE /api/spending/:id
  // Delete a spending entry (only if it belongs to authenticated user)
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const deleted = await Spending.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Spending record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Spending deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
