const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    card_id: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    cashback_pct: { type: Number, default: 0 },
    point_mul: { type: Number, default: 0 },
    cashback_equiv_pct: { type: Number, required: true },
  },
  {
    timestamps: true,
    collection: 'reward', // cardwise.reward
  }
);

const Reward = mongoose.model('Reward', rewardSchema);
module.exports = Reward;
