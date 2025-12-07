// server/src/models/Card.js
const mongoose = require('mongoose');

const rewardsSchema = new mongoose.Schema(
  {
    dining: { type: Number, default: 1 },     // e.g. 3 = 3x, 5 = 5%
    groceries: { type: Number, default: 1 },
    travel: { type: Number, default: 1 },
    gas: { type: Number, default: 1 },
    other: { type: Number, default: 1 },
  },
  { _id: false }
);

const signupBonusSchema = new mongoose.Schema(
  {
    description: { type: String },            // e.g. "60k points after $4k spend"
    bonusValue: { type: Number },             // optional numeric value (points or $)
    spendRequirement: { type: Number },       // amount required to get bonus
    timeframeMonths: { type: Number },        // e.g. 3 months
  },
  { _id: false }
);

const cardSchema = new mongoose.Schema(
  {
    bank: {
      type: String,
      required: true,
      trim: true,                             // e.g. "Chase", "Bank of America"
    },
    name: {
      type: String,
      required: true,
      trim: true,                             // e.g. "Sapphire Preferred"
    },
    network: {
      type: String,
      enum: ['Visa', 'Mastercard', 'Amex', 'Discover', 'Other'],
      default: 'Visa',
    },
    annualFee: {
      type: Number,
      default: 0,
    },
    foreignTransactionFee: {
      type: Number,                           // percentage, e.g. 3 for 3%
      default: 0,
    },
    rewards: {
      type: rewardsSchema,
      default: () => ({}),
    },
    signupBonus: {
      type: signupBonusSchema,
      default: () => ({}),
    },
    tags: [
      {
        type: String,                         // e.g. "travel", "no-fee", "student"
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Avoid duplicate cards from the same bank
cardSchema.index({ bank: 1, name: 1 }, { unique: true });

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
