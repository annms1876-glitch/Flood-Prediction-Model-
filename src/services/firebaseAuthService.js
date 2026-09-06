// Firebase Authentication Service
// Provides authentication functions using Firebase Auth client SDK
// These functions are designed for client-side use (browser/mobile)

import { auth, isConfigured } from '../config/firebase-client.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, getIdToken } from 'firebase/auth';

class FirebaseAuthService {
  constructor() {
    this.auth = auth;
    this.initialized = isConfigured();
  }

  /**
   * Check if Firebase Auth is properly initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized && this.auth !== null;
  }

  /**
   * Create a new user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} User credential with user info and token
   * 
   * @example
   * const result = await firebaseAuthService.signUp('user@example.com', 'password123');
   * console.log('User ID:', result.user.uid);
   * console.log('Email:', result.user.email);
   * console.log('Token:', result.token);
   */
  async signUp(email, password) {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check configuration.');
    }

    // Validate inputs
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required and must be a string');
    }

    if (!password || typeof password !== 'string') {
      throw new Error('Password is required and must be a string');
    }

    // Password strength validation
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email.trim().toLowerCase(),
        password
      );

      const user = userCredential.user;

      // Get ID token for authentication with other services (e.g., Supabase)
      const token = await this._getIdToken(user);

      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          emailVerified: user.emailVerified,
          createdAt: user.metadata.creationTime,
          lastSignedIn: user.metadata.lastSignInTime
        },
        token: token,
        providerId: user.providerData?.[0]?.providerId || 'password'
      };
    } catch (error) {
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('An account with this email already exists');
        case 'auth/invalid-email':
          throw new Error('Invalid email address');
        case 'auth/weak-password':
          throw new Error('Password must be at least 6 characters');
        case 'auth/operation-not-allowed':
          throw new Error('Email/password accounts are not enabled. Please enable them in Firebase Console.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection and try again.');
        default:
          console.error('SignUp error:', error);
          throw new Error(`Failed to create account: ${error.message}`);
      }
    }
  }

  /**
   * Sign in an existing user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} User credential with user info and token
   * 
   * @example
   * const result = await firebaseAuthService.signIn('user@example.com', 'password123');
   * console.log('User ID:', result.user.uid);
   * console.log('Token:', result.token);
   */
  async signIn(email, password) {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check configuration.');
    }

    // Validate inputs
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required and must be a string');
    }

    if (!password || typeof password !== 'string') {
      throw new Error('Password is required and must be a string');
    }

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email.trim().toLowerCase(),
        password
      );

      const user = userCredential.user;

      // Get ID token for authentication with other services
      const token = await this._getIdToken(user);

      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          emailVerified: user.emailVerified,
          createdAt: user.metadata.creationTime,
          lastSignedIn: user.metadata.lastSignInTime
        },
        token: token,
        providerId: user.providerData?.[0]?.providerId || 'password'
      };
    } catch (error) {
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email');
        case 'auth/wrong-password':
          throw new Error('Incorrect password');
        case 'auth/invalid-email':
          throw new Error('Invalid email address');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled');
        case 'auth/user-token-expired':
          throw new Error('Session expired. Please sign in again.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection and try again.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later.');
        default:
          console.error('SignIn error:', error);
          throw new Error(`Failed to sign in: ${error.message}`);
      }
    }
  }

  /**
   * Get the currently authenticated user
   * @returns {Promise<Object|null>} User object or null if not authenticated
   * 
   * @example
   * const user = await firebaseAuthService.getCurrentUser();
   * if (user) {
   *   console.log('User is signed in:', user.email);
   * } else {
   *   console.log('No user is signed in');
   * }
   */
  async getCurrentUser() {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check configuration.');
    }

    return new Promise((resolve, reject) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            emailVerified: user.emailVerified,
            createdAt: user.metadata.creationTime,
            lastSignedIn: user.metadata.lastSignInTime,
            providerId: user.providerData?.[0]?.providerId || 'password'
          });
        } else {
          resolve(null);
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * Check if a user is currently signed in (synchronous)
   * @returns {boolean}
   */
  isUserSignedIn() {
    if (!this.isInitialized()) {
      return false;
    }

    const user = this.auth.currentUser;
    return user !== null && user !== undefined;
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   * 
   * @example
   * await firebaseAuthService.signOut();
   * console.log('User signed out successfully');
   */
  async signOut() {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check configuration.');
    }

    try {
      await signOut(this.auth);
      return;
    } catch (error) {
      console.error('SignOut error:', error);
      throw new Error(`Failed to sign out: ${error.message}`);
    }
  }

  /**
   * Get the Firebase ID token for the current user
   * This token can be used to authenticate with other services (e.g., Supabase)
   * @returns {Promise<string|null>} ID token or null if no user is signed in
   * 
   * @example
   * const token = await firebaseAuthService.getToken();
   * if (token) {
   *   // Use token with Supabase
   *   const supabase = createClient(url, key, {
   *     global: {
   *       headers: { Authorization: `Bearer ${token}` }
   *     }
   *   });
   * }
   */
  async getToken() {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check configuration.');
    }

    const user = this.auth.currentUser;

    if (!user) {
      return null;
    }

    try {
      // Force refresh if needed
      const token = await getIdToken(user, true);
      return token;
    } catch (error) {
      console.error('GetToken error:', error);
      throw new Error(`Failed to get ID token: ${error.message}`);
    }
  }

  /**
   * Send email verification to the current user
   * @returns {Promise<void>}
   */
  async sendEmailVerification() {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check configuration.');
    }

    const user = this.auth.currentUser;

    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      await this.auth.sendEmailVerification(user);
      return;
    } catch (error) {
      console.error('SendEmailVerification error:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User's email address
   * @returns {Promise<void>}
   * 
   * @example
   * await firebaseAuthService.sendPasswordResetEmail('user@example.com');
   * console.log('Password reset email sent');
   */
  async sendPasswordResetEmail(email) {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check configuration.');
    }

    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }

    try {
      await this.auth.sendPasswordResetEmail(email.trim().toLowerCase());
      return;
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          // For security, don't reveal if user exists
          return;
        case 'auth/invalid-email':
          throw new Error('Invalid email address');
        default:
          console.error('SendPasswordResetEmail error:', error);
          throw new Error(`Failed to send reset email: ${error.message}`);
      }
    }
  }

  /**
   * Reload user data from server
   * @returns {Promise<Object|null>} Refreshed user data or null
   */
  async reloadUser() {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check configuration.');
    }

    const user = this.auth.currentUser;

    if (!user) {
      return null;
    }

    try {
      await user.reload();
      return this.getCurrentUser();
    } catch (error) {
      console.error('ReloadUser error:', error);
      throw new Error(`Failed to reload user: ${error.message}`);
    }
  }

  /**
   * Internal helper to get ID token with error handling
   * @private
   */
  async _getIdToken(user) {
    try {
      const token = await getIdToken(user, false);
      return token;
    } catch (error) {
      // If we can't get token immediately, try once more
      console.warn('Initial token fetch failed, retrying...', error);
      try {
        const token = await getIdToken(user, true);
        return token;
      } catch (retryError) {
        console.error('Failed to get ID token after retry:', retryError);
        throw new Error('Unable to obtain authentication token');
      }
    }
  }
}

// Singleton instance
const firebaseAuthService = new FirebaseAuthService();

export default firebaseAuthService;
export { FirebaseAuthService };
