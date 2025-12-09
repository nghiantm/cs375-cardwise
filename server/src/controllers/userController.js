// server/src/controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Card = require('../models/Card');
const Reward = require('../models/Reward');
const { generateToken } = require('../utils/jwt');
const { verifyFirebaseToken, getUserFromFirebaseToken } = require('../config/firebase');

// POST /api/users/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required',
      });
    }

    const existingUser = await User.exists({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      profile: {
        firstName,
        lastName,
      },
    });

    // Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.profile.firstName,
        lastName: newUser.profile.lastName,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/login
// Supports both traditional email/password and Firebase token login
exports.login = async (req, res, next) => {
  try {
    const { email, password, firebaseToken } = req.body;

    // Firebase token login
    if (firebaseToken) {
      return await loginWithFirebase(firebaseToken, req, res, next);
    }

    // Traditional email/password login
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user has a password (not Firebase-only user)
    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Firebase authentication. Please sign in with Firebase.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        ownedCards: user.ownedCards || [],
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to handle Firebase token login
 */
async function loginWithFirebase(firebaseToken, req, res, next) {
  try {
    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(firebaseToken);
    const firebaseUser = await getUserFromFirebaseToken(decodedToken);

    // Check if user already exists in our database
    let user = await User.findOne({
      $or: [
        { firebaseUid: firebaseUser.firebaseUid },
        { email: firebaseUser.email.toLowerCase() },
      ],
    });

    if (user) {
      // Update firebaseUid if it's a legacy user
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUser.firebaseUid;
        await user.save();
      }
    } else {
      // Create new user from Firebase data
      const nameParts = (firebaseUser.displayName || '').split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      user = await User.create({
        email: firebaseUser.email.toLowerCase(),
        firebaseUid: firebaseUser.firebaseUid,
        profile: {
          firstName,
          lastName,
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        ownedCards: user.ownedCards || [],
      },
      token,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Firebase authentication failed: ' + error.message,
    });
  }
}

// PATCH /api/users/:id/owned-cards
// Update user's owned cards (user can only update their own cards)
exports.updateOwnedCards = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cardIds } = req.body;

    // Verify the user is updating their own cards
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own cards',
      });
    }

    if (!Array.isArray(cardIds)) {
      return res.status(400).json({
        success: false,
        message: 'cardIds must be an array of card_id strings',
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { ownedCards: cardIds },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Owned cards updated',
      data: {
        id: user._id,
        email: user.email,
        ownedCards: user.ownedCards,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id/investment-simulations
// Estimate category savings and investment projections
exports.getInvestmentSimulation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user || String(req.user.id) !== String(id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only view simulations for your own account',
      });
    }

    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const ownedCards = Array.isArray(user.ownedCards) ? user.ownedCards : [];
    if (ownedCards.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Add cards to your profile to run the investment simulator',
      });
    }

    const spendingByCategory = extractSpendingFromQuery(req.query);
    const categories = Object.keys(spendingByCategory);

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one *_spending query parameter with a positive amount is required',
      });
    }

    const bestRewards = {};
    const cardIds = new Set();

    for (const category of categories) {
      const reward = await findBestRewardForCategory(category, ownedCards);
      if (!reward) {
        continue;
      }
      bestRewards[category] = {
        reward,
        spend: spendingByCategory[category],
      };
      cardIds.add(reward.card_id);
    }

    if (Object.keys(bestRewards).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No reward data available for the requested categories',
      });
    }

    const cardMap = await getCardDetails(Array.from(cardIds));
    let totalSavings = 0;
    const cardsResponse = {};
    let totalAnnualFees = 0;
    const countedFees = new Set();

    for (const [category, info] of Object.entries(bestRewards)) {
      const { reward, spend } = info;
      const savings = Number((spend * (reward.cashback_equiv_pct / 100)).toFixed(2));
      totalSavings += savings;

      const card = cardMap[reward.card_id] || {};

      if (!countedFees.has(reward.card_id)) {
        countedFees.add(reward.card_id);
        const fee = typeof card.annual_fee === 'number' ? card.annual_fee : 0;
        if (fee > 0) {
          totalAnnualFees += fee;
        }
      }

      cardsResponse[category] = {
        card_id: reward.card_id,
        card_name: card.card_name,
        bank_id: card.bank_id,
        annual_fee: card.annual_fee,
        img_url: card.img_url,
        cashback_equiv_pct: reward.cashback_equiv_pct,
        saving: savings,
      };
    }

    const investmentResults = calculateInvestmentGrowth(totalSavings, totalAnnualFees);
    const summaryInfo = buildInvestmentSummary(investmentResults);

    return res.status(200).json({
      success: true,
      data: {
        cards: cardsResponse,
        investment_results: investmentResults,
        total_monthly_savings: Number(totalSavings.toFixed(2)),
        total_annual_fees: Number(totalAnnualFees.toFixed(2)),
        investment_summary: summaryInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me
// Get current authenticated user's information
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firebaseUid: user.firebaseUid,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        age: user.profile?.age,
        creditScore: user.profile?.creditScore,
        address: user.profile?.address,
        ownedCards: user.ownedCards,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helpers
const CATEGORY_ALIAS = {
  grocery: ['groceries'],
  groceries: ['groceries'],
  online: ['online_shopping'],
  pharma: ['pharmacy'],
  pharmacy: ['pharmacy'],
};

function normalizeCategoryKey(rawKey = '') {
  return rawKey
    .toLowerCase()
    .replace(/_spending$/, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function extractSpendingFromQuery(query) {
  const spending = {};
  for (const [key, value] of Object.entries(query)) {
    if (!key.includes('spending')) continue;
    const normalizedKey = normalizeCategoryKey(key);
    if (!normalizedKey) continue;

    const amount = Array.isArray(value) ? value[value.length - 1] : value;
    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      continue;
    }

    spending[normalizedKey] = (spending[normalizedKey] || 0) + parsed;
  }
  return spending;
}

function getCategoryCandidates(category) {
  const normalized = category.toLowerCase();
  const candidates = new Set([normalized]);
  const aliasList = CATEGORY_ALIAS[normalized];
  if (aliasList) {
    aliasList.forEach((alias) => candidates.add(alias));
  }

  if (normalized.endsWith('y')) {
    candidates.add(`${normalized.slice(0, -1)}ies`);
  }

  return Array.from(candidates);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findBestRewardForCategory(category, allowedCards = []) {
  if (!Array.isArray(allowedCards) || allowedCards.length === 0) {
    return null;
  }

  const baseCardFilter = { card_id: { $in: allowedCards } };
  const candidates = getCategoryCandidates(category);
  for (const candidate of candidates) {
    const reward = await Reward.findOne({
      category: new RegExp(`^${escapeRegex(candidate)}$`, 'i'),
      ...baseCardFilter,
    })
      .sort({ cashback_equiv_pct: -1 })
      .lean();
    if (reward) {
      return reward;
    }
  }

  return Reward.findOne({
    category: new RegExp('^all$', 'i'),
    ...baseCardFilter,
  })
    .sort({ cashback_equiv_pct: -1 })
    .lean();
}

async function getCardDetails(cardIds) {
  if (!cardIds.length) {
    return {};
  }
  const cards = await Card.find({ card_id: { $in: cardIds } }).lean();
  return cards.reduce((acc, card) => {
    acc[card.card_id] = card;
    return acc;
  }, {});
}

function calculateInvestmentGrowth(baseAmount, totalAnnualFees = 0) {
  const ANNUAL_RATE = 0.1; // assumed 10% yearly return
  const monthlyRate = ANNUAL_RATE / 12;
  const horizons = [1, 6, 12, 18, 24]; // months
  const maxMonths = Math.max(...horizons);

  const results = {};
  let principal = 0;
  let balance = 0;

  for (let month = 1; month <= maxMonths; month++) {
    principal += baseAmount;
    balance += baseAmount;

    if (totalAnnualFees > 0 && month % 12 === 0) {
      principal -= totalAnnualFees;
      balance -= totalAnnualFees;
    }

    if (principal < 0) principal = 0;
    if (balance < 0) balance = 0;

    if (monthlyRate > 0) {
      balance *= 1 + monthlyRate;
    }

    if (horizons.includes(month)) {
      const interest = balance - principal;
      results[month] = {
        principal: Number(principal.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        total: Number(balance.toFixed(2)),
      };
    }
  }

  results.metadata = {
    annual_rate: ANNUAL_RATE,
    monthly_rate: monthlyRate,
    annual_fee_total: totalAnnualFees,
  };

  return results;
}

function buildInvestmentSummary(results) {
  const keys = Object.keys(results).filter((key) => key !== 'metadata');
  if (keys.length === 0) {
    return null;
  }
  const sortedMonths = keys.map(Number).sort((a, b) => a - b);
  const finalMonths = sortedMonths[sortedMonths.length - 1];
  const finalData = results[finalMonths];
  return {
    months: finalMonths,
    principal: finalData.principal,
    interest: finalData.interest,
    total: finalData.total,
  };
}
