// server/src/controllers/spendingController.js
const Spending = require('../models/Spending');

// NOTE: This controller still uses a hard-coded userId for now.
// Once auth is implemented, this should come from req.user._id (JWT middleware).

exports.createSpending = async (req, res, next) => {
  // POST /api/spending
  // Create a new spending entry
  try {
    const { amount, category, date, merchant, notes, cardUsed, cardId } = req.body;

    // Validate required fields
    if (amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Amount and category are required',
      });
    }

    // Temporary: hardcoded userId until auth is wired up
    const userId = '691e5bb8367d68ed3a766bfd';

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
    await newSpending.populate('cardId', 'bank name network');

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
  try {
    // Temporary: hardcoded userId until auth is wired up
    const userId = '691e5bb8367d68ed3a766bfd';

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
      .populate('cardId', 'bank name network')
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
  try {
    const { id } = req.params;

    const spending = await Spending.findById(id)
      .populate('userId', 'profile.firstName profile.lastName')
      .populate('cardId', 'bank name network');

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
  try {
    const { id } = req.params;
    const { amount, category, date, merchant, notes, cardUsed, cardId } = req.body;

    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (category) updateData.category = category;
    if (date) updateData.date = date;
    if (merchant !== undefined) updateData.merchant = merchant; // Allow clearing
    if (notes !== undefined) updateData.notes = notes;
    if (cardUsed !== undefined) updateData.cardUsed = cardUsed;
    if (cardId !== undefined) updateData.cardId = cardId;

    const updated = await Spending.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'profile.firstName profile.lastName')
      .populate('cardId', 'bank name network');

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
  try {
    const { id } = req.params;
    const deleted = await Spending.findByIdAndDelete(id);

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
