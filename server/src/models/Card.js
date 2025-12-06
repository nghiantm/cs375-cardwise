const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    card_id: { type: String, required: true, unique: true },
    card_name: { type: String, required: true },
    card_type: { type: String, enum: ['cashback', 'point'], required: true },
    bank_id: { type: String, required: true },
    img_url: { type: String },
    annual_fee: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'info', // cardwise.info
  }
);

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;
