// Firebase Configuration
// This module handles Firebase Admin SDK initialization for backend services
// Provides push notifications (FCM) and Firestore database access

const path = require('path');

// Firebase Admin SDK
let admin = null;
let adminAvailable = false;

try {
  admin = require('firebase-admin');
  adminAvailable = true;
} catch (e) {
  console.warn('⚠️  firebase-admin not installed. Install with: npm install firebase-admin');
}

// Firebase initialization state
let firebaseApp = null;
let firestoreDb = null;

/**
 * Parse Firebase credential from various sources
 * @param {Object|string|null} credentialOption - Credential option from config
 * @returns {Object|null} Firebase credential or null
 */
function parseCredential(credentialOption) {
  if (!credentialOption) {
    // Try environment variable with JSON string
    const envJson = process.env.FIREBASE_CREDENTIAL_JSON;
    if (envJson) {
      try {
        return JSON.parse(envJson);
      } catch (e) {
        console.error('❌ Invalid FIREBASE_CREDENTIAL_JSON format');
        return null;
      }
    }
    return null;
  }

  // If it's already an object, use it directly
  if (typeof credentialOption === 'object') {
    return credentialOption;
  }

  // If it's a file path, read and parse the JSON
  if (typeof credentialOption === 'string') {
    try {
      const resolvedPath = path.resolve(credentialOption);
      const fs = require('fs');
      
      if (!fs.existsSync(resolvedPath)) {
        console.error(`❌ Firebase credential file not found: ${resolvedPath}`);
        console.log('   Download from Firebase Console > Project Settings > Service Accounts');
        return null;
      }
      
      const credentialData = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      return credentialData;
    } catch (e) {
      console.error('❌ Failed to read Firebase credential file:', e.message);
      return null;
    }
  }

  return null;
}

/**
 * Initialize Firebase Admin SDK
 * Must be called before using any Firebase services
 * 
 * Configuration priority:
 * 1. Options passed to initializeApp()
 * 2. Environment variables (FIREBASE_CREDENTIAL_PATH, FIREBASE_CREDENTIAL_JSON)
 * 3. config/service-account.json (default location)
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.credentialPath] - Path to service account JSON file
 * @param {Object} [options.credential] - Firebase credential object
 * @param {string} [options.projectId] - Firebase project ID
 * @returns {firebase.app.App|null} Firebase app instance or null if not configured
 */
function initializeApp(options = {}) {
  // Already initialized
  if (firebaseApp) {
    console.log('ℹ️  Firebase app already initialized');
    return firebaseApp;
  }

  // Firebase Admin not available
  if (!adminAvailable || !admin) {
    console.warn('⚠️  Firebase Admin SDK not installed. Push notifications disabled.');
    return null;
  }

  // Get credential from options or environment
  const credentialData = options.credential || parseCredential(options.credentialPath || process.env.FIREBASE_CREDENTIAL_PATH);
  const projectId = options.projectId || process.env.FIREBASE_PROJECT_ID;

  try {
    const appConfig = {
      projectId: projectId
    };

    // Add credential if available
    if (credentialData) {
      appConfig.credential = admin.credential.cert(credentialData);
    } else {
      console.warn('⚠️  No Firebase credentials provided. Push notifications will not work.');
      console.log('   Configure via:');
      console.log('   - Option 1: Set FIREBASE_CREDENTIAL_PATH in .env');
      console.log('   - Option 2: Set FIREBASE_CREDENTIAL_JSON in .env');
      console.log('   - Option 3: Pass credential in initializeApp() options');
    }

    firebaseApp = admin.initializeApp(appConfig);

    // Initialize Firestore
    try {
      firestoreDb = firebaseApp.firestore();
      console.log('✅ Firebase Admin SDK initialized successfully');
      if (credentialData) {
        console.log(`   Project: ${projectId || credentialData.project_id}`);
        console.log('   Services: Messaging, Firestore');
      }
    } catch (e) {
      console.warn('⚠️  Firestore initialization failed:', e.message);
    }

    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    firebaseApp = null;
    return null;
  }
}

/**
 * Initialize Firebase from environment variables only
 * Call this if you want auto-init from .env without passing options
 */
function initializeFromEnv() {
  return initializeApp({
    credentialPath: process.env.FIREBASE_CREDENTIAL_PATH,
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

/**
 * Get Firestore database instance
 * @returns {firebase.firestore.Firestore|null}
 */
function getFirestore() {
  if (!firestoreDb) {
    console.warn('⚠️  Firestore not initialized. Call initializeApp() first.');
    return null;
  }
  return firestoreDb;
}

/**
 * Check if Firebase is initialized and ready
 * @returns {boolean}
 */
function isInitialized() {
  return firebaseApp !== null;
}

/**
 * Check if Firebase Admin SDK is available (installed)
 * @returns {boolean}
 */
function isAvailable() {
  return adminAvailable && !!admin;
}

/**
 * Reset Firebase initialization (for testing)
 */
function reset() {
  firebaseApp = null;
  firestoreDb = null;
}

module.exports = {
  initializeApp,
  initializeFromEnv,
  getFirestore,
  isInitialized,
  isAvailable,
  reset,
  admin
};
