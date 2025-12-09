/**
 * Firebase Client Configuration
 * Initializes Firebase Auth for Google sign-in
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (only if not already initialized)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
) {
  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
    console.log('📋 Firebase Config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasApiKey: !!firebaseConfig.apiKey,
    });
  } else {
    app = existingApps[0];
    auth = getAuth(app);
    console.log('✅ Firebase already initialized');
  }
} else {
  console.warn(
    '⚠️  Firebase configuration missing. Google sign-in will not work. Please set VITE_FIREBASE_* environment variables.'
  );
  console.warn('Missing config:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
  });
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Export auth instance
export { auth };
export default app;

