// Authentication Middleware
// JWT-based authentication for protected routes

const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Requires Bearer token in Authorization header
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.jwtSecret - Secret key for verifying tokens (required)
 * @param {string[]} options.roles - Allowed roles (optional)
 * @param {boolean} options.requireAuth - Whether auth is required (default: true)
 */
function authenticate(options = {}) {
  const {
    jwtSecret = process.env.JWT_SECRET,
    roles = [],
    requireAuth = true
  } = options;

  return async (req, res, next) => {
    try {
      // Skip authentication if not required
      if (!requireAuth) {
        return next();
      }

      // Get authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Authorization header missing',
          code: 'MISSING_AUTH'
        });
      }

      // Check Bearer scheme
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
          success: false,
          error: 'Invalid authorization format. Use: Bearer <token>',
          code: 'INVALID_AUTH_FORMAT'
        });
      }

      const token = parts[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token missing',
          code: 'MISSING_TOKEN'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, jwtSecret);

      // Check role if specified
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'FORBIDDEN_ROLE'
        });
      }

      // Attach user info to request
      req.user = {
        id: decoded.sub || decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user',
        permissions: decoded.permissions || []
      };

      // Add request ID for tracing
      req.requestId = req.headers['x-request-id'] || require('crypto').randomBytes(16).toString('hex');

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication error',
        code: 'AUTH_ERROR'
      });
    }
  };
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work with or without auth
 */
function optionalAuth(options = {}) {
  return authenticate({ ...options, requireAuth: false });
}

/**
 * Generate JWT token
 * 
 * @param {Object} payload - Token payload
 * @param {string} payload.userId - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role
 * @param {Object} options - JWT options
 * @returns {string} JWT token
 */
function generateToken(payload, options = {}) {
  const {
    expiresIn = '24h',
    jwtSecret = process.env.JWT_SECRET
  } = options;

  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role || 'user',
      permissions: payload.permissions || []
    },
    jwtSecret,
    { expiresIn }
  );
}

/**
 * Refresh token middleware
 * Issues new token before old one expires
 */
function refreshToken(req, res) {
  const { user } = req;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'No user information available'
    });
  }

  const newToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  res.json({
    success: true,
    token: newToken,
    expiresIn: '24h'
  });
}

module.exports = {
  authenticate,
  optionalAuth,
  generateToken,
  refreshToken
};
