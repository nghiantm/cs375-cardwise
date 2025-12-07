/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user info to request
 */

const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and attach user to request
 * This makes routes protected - only authenticated users can access
 */
async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }

    // Verify the token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user info to request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      firebaseUid: user.firebaseUid,
      profile: user.profile,
      ownedCards: user.ownedCards,
    };

    // Attach the full user document for convenience
    req.userDoc = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token',
    });
  }
}

/**
 * Smart authentication middleware
 * - In production (USE_DEV_AUTH=false): Requires JWT token
 * - In development (USE_DEV_AUTH=true): Uses hardcoded user ID
 */
async function smartAuthenticate(req, res, next) {
  const useDevAuth = process.env.USE_DEV_AUTH === 'true';

  if (useDevAuth) {
    // Development mode - use hardcoded user
    const DEV_USER_ID = process.env.DEV_USER_ID ;
    
    try {
      const user = await User.findById(DEV_USER_ID);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `DEV MODE: User not found with ID: ${DEV_USER_ID}`,
        });
      }

      // Attach user to request (same format as JWT auth)
      req.user = {
        id: user._id.toString(),
        email: user.email,
        firebaseUid: user.firebaseUid,
        profile: user.profile,
        ownedCards: user.ownedCards,
      };

      req.userDoc = user;

      // Log in dev mode so you know it's being used
      if (!req.app.locals.devAuthLogged) {
        console.log(`🔓 DEV MODE: Authentication bypassed, using user: ${user.email} (${DEV_USER_ID})`);
        req.app.locals.devAuthLogged = true;
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'DEV MODE: Authentication error: ' + error.message,
      });
    }
  }

  // Production mode - use JWT authentication
  return authenticate(req, res, next);
}

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for routes that work differently for authenticated vs unauthenticated users
 */
async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (user) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        firebaseUid: user.firebaseUid,
        profile: user.profile,
        ownedCards: user.ownedCards,
      };
      req.userDoc = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // Token is invalid, but we don't fail - just continue without user
    req.user = null;
    next();
  }
}

module.exports = {
  authenticate,
  smartAuthenticate,
  optionalAuthenticate,
};
