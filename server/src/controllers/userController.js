// server/src/controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
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
