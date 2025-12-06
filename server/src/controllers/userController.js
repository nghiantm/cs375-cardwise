// server/src/controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');

// POST /api/users/register
async function register(req, res, next) {
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

    const existingUser = await User.exists({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      email,
      passwordHash,
      profile: {
        firstName,
        lastName,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.profile.firstName,
        lastName: newUser.profile.lastName,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/users/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // later we can add JWT here
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
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/users/:id/owned-cards
async function updateOwnedCards(req, res, next) {
  try {
    const { id } = req.params;
    const { cardIds } = req.body;

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
}

module.exports = {
  register,
  login,
  updateOwnedCards,
};
