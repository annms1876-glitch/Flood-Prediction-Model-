// Firebase Client SDK Configuration
// Uses Firebase client SDK (firebase) for client-side authentication operations
//
// This is different from firebase-admin which is for backend server operations.

let auth = null;
let firebaseApp = null;
let configured = false;

try {
  const { initializeApp, getApps } = require('firebase/app');
  const { getAuth } = require('firebase/auth');

  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };

  // Only initialize if required config is present (avoids invalid-api-key crash)
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = requiredKeys.filter((key) => !firebaseConfig[key]);

  if (missing.length > 0 || (firebaseConfig.apiKey && firebaseConfig.apiKey.includes('your-firebase'))) {
    console.warn('⚠️  Firebase client config incomplete or using placeholder values. Skipping init.');
  } else {
    firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    configured = true;
    console.log('✅ Firebase client SDK initialized');
  }
} catch (error) {
  console.warn('⚠️  Firebase client SDK initialization failed:', error.message);
}

// Export auth instance for client-side authentication
module.exports = { auth, firebaseApp, configured };

// Helper functions
module.exports.isConfigured = function isConfigured() {
  return configured && !!auth;
};

module.exports.getMissingConfig = function getMissingConfig() {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];

  return required.filter((key) => !process.env[key]);
};
