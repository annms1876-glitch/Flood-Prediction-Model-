// Firebase Client SDK Configuration
// Uses Firebase client SDK (firebase) for browser/client-side operations
// 
// NOTE: This module requires the 'firebase' npm package to be installed:
//   npm install firebase
//
// This is different from firebase-admin which is for backend server operations.
// Use this for client-side authentication and Firebase services.

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase app
let app;
let auth;
let configured = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  configured = true;
  console.log('✅ Firebase client SDK initialized');
} catch (error) {
  console.warn('⚠️  Firebase client SDK initialization failed:', error.message);
  console.log('   Ensure all Firebase environment variables are set:');
  console.log('   - FIREBASE_API_KEY');
  console.log('   - FIREBASE_AUTH_DOMAIN');
  console.log('   - FIREBASE_PROJECT_ID');
  console.log('   - FIREBASE_STORAGE_BUCKET');
  console.log('   - FIREBASE_MESSAGING_SENDER_ID');
  console.log('   - FIREBASE_APP_ID');
}

// Export auth instance for client-side authentication
export { auth, app as firebaseApp };

// Helper functions
export function isConfigured() {
  return configured && !!auth;
}

export function getMissingConfig() {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];
  
  return required.filter(key => !process.env[key]);
}
