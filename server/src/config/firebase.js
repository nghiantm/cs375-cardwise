/**
 * Firebase Admin SDK Configuration
 * This file initializes Firebase Admin for server-side authentication
 */

const admin = require('firebase-admin');

let firebaseApp = null;

function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if Firebase credentials are provided
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccount) {
      // Initialize with service account JSON
      const credentials = JSON.parse(serviceAccount);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
      console.log('✅ Firebase Admin initialized with service account');
    } else {
      // For development, you can use application default credentials
      // or skip Firebase initialization if not needed
      console.log('⚠️  Firebase service account not configured. Firebase auth disabled.');
      return null;
    }

    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    return null;
  }
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<DecodedIdToken>} Decoded token with user info
 */
async function verifyFirebaseToken(idToken) {
  const app = initializeFirebase();
  
  if (!app) {
    throw new Error('Firebase not initialized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token: ' + error.message);
  }
}

/**
 * Get or create user from Firebase token
 * @param {DecodedIdToken} decodedToken - Decoded Firebase token
 * @returns {Promise<Object>} User info
 */
async function getUserFromFirebaseToken(decodedToken) {
  return {
    firebaseUid: decodedToken.uid,
    email: decodedToken.email,
    emailVerified: decodedToken.email_verified,
    displayName: decodedToken.name,
    photoURL: decodedToken.picture,
  };
}

module.exports = {
  initializeFirebase,
  verifyFirebaseToken,
  getUserFromFirebaseToken,
  admin,
};
