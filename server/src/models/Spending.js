// server/src/models/Spending.js
const mongoose = require('mongoose');

const spendingSchema = new mongoose.Schema(
  {
    // Link each spending entry to a user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Amount for the transaction
    amount: {
      type: Number,
      required: true,
    },

    // Category of the transaction (dining, travel, groceries, etc.)
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Date of the transaction (defaults to now)
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Merchant name (optional)
    merchant: {
      type: String,
      trim: true,
    },

    // Notes about the transaction (optional)
    notes: {
      type: String,
      trim: true,
    },

    /**
     * Card linkage
     *
     * cardId: optional reference to the Card document
     * cardUsed: optional free-text label (kept for backwards compatibility)
     */
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },

    cardUsed: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// create model factory
const Spending = mongoose.model('Spending', spendingSchema);

// export the model
module.exports = Spending;
