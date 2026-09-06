// Authentication Routes
// Firebase Auth endpoints for signup, signin, password reset, etc.

const express = require('express');
const router = express.Router();

const firebaseAuthService = require('../services/firebaseAuthService');
const emailService = require('../services/emailService');
const { authRateLimitMiddleware } = require('../middleware/rateLimit');
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================================
// AUTH INFO
// ============================================================

router.get('/', (req, res) => {
  res.json({
    authentication: {
      enabled: true,
      providers: ['firebase_auth'],
      oauthProviders: ['google', 'github'],
      endpoints: {
        info: { method: 'GET', path: '/api/auth' },
        currentUser: { method: 'GET', path: '/api/auth/me' },
        signUp: { method: 'POST', path: '/api/auth/signup' },
        signIn: { method: 'POST', path: '/api/auth/signin' },
        signOut: { method: 'POST', path: '/api/auth/signout' },
        sendVerification: { method: 'POST', path: '/api/auth/send-verification' },
        verifyEmail: { method: 'POST', path: '/api/auth/verify-email' },
        resetPassword: { method: 'POST', path: '/api/auth/reset-password' },
        confirmReset: { method: 'POST', path: '/api/auth/confirm-reset' },
        refreshToken: { method: 'POST', path: '/api/auth/refresh-token' }
      }
    }
  });
});

// ============================================================
// GET CURRENT USER
// ============================================================

router.get('/me', asyncHandler(async (req, res) => {
  const user = await firebaseAuthService.getCurrentUser();

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'No authenticated user',
      code: 'NOT_AUTHENTICATED'
    });
  }

  res.json({
    success: true,
    data: user,
    isAuthenticated: true
  });
}));

// ============================================================
// SIGN UP
// ============================================================

router.post('/signup', authRateLimitMiddleware, asyncHandler(async (req, res) => {
  const { email, password, displayName } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
      code: 'MISSING_FIELDS'
    });
  }

  // Basic validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters',
      code: 'WEAK_PASSWORD'
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
      code: 'INVALID_EMAIL'
    });
  }

  const result = await firebaseAuthService.signUp(email, password);

  // Send welcome email
  try {
    await emailService.sendNotificationEmail(email, 'welcome', {
      userName: displayName || email.split('@')[0],
      userId: result.user.uid
    });
  } catch (emailError) {
    console.warn('Failed to send welcome email:', emailError.message);
  }

  res.status(201).json({
    success: true,
    data: result.user,
    token: result.token,
    message: 'Account created successfully'
  });
}));

// ============================================================
// SIGN IN
// ============================================================

router.post('/signin', authRateLimitMiddleware, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
      code: 'MISSING_FIELDS'
    });
  }

  const result = await firebaseAuthService.signIn(email, password);

  res.json({
    success: true,
    data: result.user,
    token: result.token,
    message: 'Signed in successfully'
  });
}));

// ============================================================
// SIGN OUT
// ============================================================

router.post('/signout', asyncHandler(async (req, res) => {
  await firebaseAuthService.signOut();

  res.json({
    success: true,
    message: 'Signed out successfully'
  });
}));

// ============================================================
// SEND EMAIL VERIFICATION
// ============================================================

router.post('/send-verification', asyncHandler(async (req, res) => {
  const user = await firebaseAuthService.getCurrentUser();

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'No authenticated user',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (user.emailVerified) {
    return res.status(400).json({
      success: false,
      error: 'Email is already verified',
      code: 'ALREADY_VERIFIED'
    });
  }

  await firebaseAuthService.sendEmailVerification();

  res.json({
    success: true,
    message: 'Verification email sent. Please check your inbox.'
  });
}));

// ============================================================
// VERIFY EMAIL
// ============================================================

router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Verification token is required',
      code: 'MISSING_TOKEN'
    });
  }

  // Note: Firebase email verification is handled via link in email
  // This endpoint is a placeholder for any custom verification logic
  res.json({
    success: true,
    message: 'Email verification endpoint. Use the link sent to your email to verify.',
    note: 'Firebase handles verification via email link'
  });
}));

// ============================================================
// REQUEST PASSWORD RESET
// ============================================================

router.post('/reset-password', authRateLimitMiddleware, asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required',
      code: 'MISSING_EMAIL'
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
      code: 'INVALID_EMAIL'
    });
  }

  // Send password reset email (Firebase handles the actual reset flow)
  await firebaseAuthService.sendPasswordResetEmail(email);

  // Always return success to prevent email enumeration
  res.json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been sent.'
  });
}));

// ============================================================
// CONFIRM PASSWORD RESET
// ============================================================

router.post('/confirm-reset', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Token and new password are required',
      code: 'MISSING_FIELDS'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters',
      code: 'WEAK_PASSWORD'
    });
  }

  // Note: Firebase handles password reset via email link
  // This endpoint is a placeholder for custom reset flow
  res.json({
    success: true,
    message: 'Password reset endpoint. Use the link sent to your email to reset your password.',
    note: 'Firebase handles password reset via email link'
  });
}));

// ============================================================
// REFRESH TOKEN
// ============================================================

router.post('/refresh-token', asyncHandler(async (req, res) => {
  const user = await firebaseAuthService.getCurrentUser();

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'No authenticated user',
      code: 'NOT_AUTHENTICATED'
    });
  }

  const token = await firebaseAuthService.getToken();

  res.json({
    success: true,
    token,
    expiresIn: '24h',
    message: 'Token refreshed successfully'
  });
}));

// ============================================================
// OAUTH PROVIDERS INFO
// ============================================================

router.get('/oauth/providers', (req, res) => {
  res.json({
    providers: [
      {
        id: 'google',
        name: 'Google',
        enabled: true,
        scopes: ['email', 'profile'],
        endpoint: '/api/auth/oauth/google'
      },
      {
        id: 'github',
        name: 'GitHub',
        enabled: true,
        scopes: ['user:email'],
        endpoint: '/api/auth/oauth/github'
      }
    ]
  });
});

// OAuth redirect endpoints (placeholder - implement with actual OAuth flow)
router.get('/oauth/google', (req, res) => {
  res.json({
    message: 'Google OAuth endpoint. Implement OAuth flow with Firebase Auth.',
    provider: 'google',
    note: 'Initialize Firebase Auth Google provider and redirect to Google sign-in'
  });
});

router.get('/oauth/github', (req, res) => {
  res.json({
    message: 'GitHub OAuth endpoint. Implement OAuth flow with Firebase Auth.',
    provider: 'github',
    note: 'Initialize Firebase Auth GitHub provider and redirect to GitHub sign-in'
  });
});

module.exports = router;
