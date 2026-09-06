// Security Middleware
// Security headers, sanitization, and protection against common attacks

const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('./rateLimit');

/**
 * Security headers configuration
 */
function securityHeaders(options = {}) {
  const {
    corsOrigin = process.env.ALLOWED_ORIGINS || '*',
    enableHSTS = true,
    enableNoCache = true
  } = options;

  return [
    // Helmet security headers
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: true,
      crossOriginResourcePolicy: { policy: 'same-origin' },
      dnsPrefetchControl: { allow: false },
      expectCt: { maxAge: 86400, enforce: true },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: enableHSTS ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      } : false,
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permissionsPolicy: {
        audioPlayback: ['self'],
        camera: [],
        crossOriginIsolated: [],
        displayCapture: [],
        fullscreen: ['self'],
        geolocation: [],
        gyroscope: [],
        magnetometer: [],
        microphone: [],
        midi: [],
        payment: [],
        usb: []
      },
      prefetchControl: { prefetch: false },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xContentTypeOptions: true,
      xDownloadOptions: true,
      xFrameOptions: { action: 'deny' },
      xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
      xXssProtection: false // Modern browsers don't use this
    }),

    // XSS protection
    xss(),

    // Prevent parameter pollution
    hpp({
      whitelist: [
        'sort',
        'order',
        'limit',
        'offset',
        'page',
        'filter',
        'search',
        'q'
      ]
    }),

    // Custom security headers
    (req, res, next) => {
      // Prevent caching of sensitive data
      if (enableNoCache) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }

      // Security policy headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '0'); // Modern browsers use CSP instead

      // Referrer policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Permissions policy
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

      // Remove server identification
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');

      next();
    }
  ];
}

/**
 * Request logging with sensitive data masking
 */
function secureLogging(options = {}) {
  const {
    logLevel = 'info',
    maskFields = ['password', 'token', 'authorization', 'api_key', 'key', 'secret']
  } = options;

  return (req, res, next) => {
    // Log request (with masked sensitive data)
    if (options.logLevel === 'debug' || options.logLevel === 'info') {
      const safeBody = maskSensitiveData(req.body, maskFields);
      const safeQuery = maskSensitiveData(req.query, maskFields);

      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      if (Object.keys(safeBody).length > 0) {
        console.log('Body:', JSON.stringify(safeBody));
      }
      if (Object.keys(safeQuery).length > 0 && req.method === 'GET') {
        console.log('Query:', JSON.stringify(safeQuery));
      }
    }

    next();
  };
}

/**
 * Mask sensitive fields in objects
 */
function maskSensitiveData(obj, fields) {
  if (!obj || typeof obj !== 'object') return obj;

  const masked = Array.isArray(obj) ? [] : {};

  for (const key of Object.keys(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = fields.some(f => lowerKey.includes(f));

    if (isSensitive && typeof obj[key] === 'string' && obj[key].length > 4) {
      masked[key] = '****' + obj[key].substring(obj[key].length - 4);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      masked[key] = maskSensitiveData(obj[key], fields);
    } else {
      masked[key] = obj[key];
    }
  }

  return masked;
}

/**
 * Input sanitization middleware
 */
function sanitizeInput() {
  return (req, res, next) => {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  };
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key of Object.keys(obj)) {
    let value = obj[key];

    if (typeof value === 'string') {
      // Remove potential HTML/JS
      value = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else if (typeof value === 'object' && value !== null) {
      value = sanitizeObject(value);
    }

    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * IP whitelist middleware (for admin endpoints)
 */
function ipWhitelist(allowedIps) {
  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress || '';

    // Handle localhost variations
    const normalizedIp = clientIp.replace(/^::ffff:/, '');

    if (allowedIps.includes(normalizedIp) || allowedIps.includes('::1') || allowedIps.includes('127.0.0.1')) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied',
      code: 'IP_NOT_ALLOWED'
    });
  };
}

/**
 * Content-Type validation
 */
function validateContentType(allowedTypes = ['application/json', 'application/x-www-form-urlencoded']) {
  return (req, res, next) => {
    const contentType = req.headers['content-type'] || '';

    const isAllowed = allowedTypes.some(type => contentType.startsWith(type));

    if (!isAllowed && req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      return res.status(415).json({
        success: false,
        error: 'Unsupported media type',
        code: 'INVALID_CONTENT_TYPE'
      });
    }

    next();
  };
}

module.exports = {
  securityHeaders,
  secureLogging,
  sanitizeInput,
  sanitizeObject,
  maskSensitiveData,
  ipWhitelist,
  validateContentType,
  rateLimit
};
