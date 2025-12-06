// server/src/controllers/recommendationController.js
const User = require('../models/User');
const Card = require('../models/Card');
const Reward = require('../models/Reward');

// helper: map card_id -> card info
async function getCardMap(cardIds) {
  const cards = await Card.find({ card_id: { $in: cardIds } });
  const map = {};
  for (const c of cards) {
    map[c.card_id] = c;
  }
  return map;
}

// GET /api/recommendations/my-cards?userId=...
// best card per category, restricted to user's owned cards
exports.getBestForUserCards = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.ownedCards || user.ownedCards.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'User has no owned cards saved',
      });
    }

    const rewards = await Reward.find({
      card_id: { $in: user.ownedCards },
    });

    // group by category, pick max cashback_equiv_pct
    const bestByCategory = {};
    for (const r of rewards) {
      const current = bestByCategory[r.category];
      if (!current || r.cashback_equiv_pct > current.cashback_equiv_pct) {
        bestByCategory[r.category] = r;
      }
    }

    const cardIds = Object.values(bestByCategory).map((r) => r.card_id);
    const cardMap = await getCardMap(cardIds);

    const result = Object.entries(bestByCategory).map(
      ([category, reward]) => {
        const card = cardMap[reward.card_id];
        return {
          category,
          card_id: reward.card_id,
          cashback_equiv_pct: reward.cashback_equiv_pct,
          card_name: card?.card_name,
          bank_id: card?.bank_id,
          annual_fee: card?.annual_fee,
          img_url: card?.img_url,
        };
      }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/recommendations/global
// rank all cards by their best category cashback_equiv_pct
exports.getGlobalRanking = async (req, res, next) => {
  try {
    const rewards = await Reward.find();

    // per card: keep best category reward
    const bestByCard = {};
    for (const r of rewards) {
      const current = bestByCard[r.card_id];
      if (!current || r.cashback_equiv_pct > current.cashback_equiv_pct) {
        bestByCard[r.card_id] = r;
      }
    }

    const cardIds = Object.keys(bestByCard);
    const cardMap = await getCardMap(cardIds);

    let ranking = cardIds.map((cardId) => {
      const reward = bestByCard[cardId];
      const card = cardMap[cardId];

      return {
        card_id: cardId,
        card_name: card?.card_name,
        bank_id: card?.bank_id,
        annual_fee: card?.annual_fee,
        img_url: card?.img_url,
        best_category: reward.category,
        best_cashback_equiv_pct: reward.cashback_equiv_pct,
      };
    });

    // sort descending by cashback, then by annual_fee ascending
    ranking.sort((a, b) => {
      if (b.best_cashback_equiv_pct !== a.best_cashback_equiv_pct) {
        return b.best_cashback_equiv_pct - a.best_cashback_equiv_pct;
      }
      return (a.annual_fee || 0) - (b.annual_fee || 0);
    });

    res.status(200).json({
      success: true,
      data: ranking,
    });
  } catch (error) {
    next(error);
  }
};
