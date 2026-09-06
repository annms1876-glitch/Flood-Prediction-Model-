// Rate Limiting Middleware
// Prevents API abuse and DDoS attacks

const crypto = require('crypto');

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute default
    this.maxRequests = options.maxRequests || 100; // 100 requests per window
    this.message = options.message || 'Too many requests, please try again later';
    this.keyPrefix = options.keyPrefix || 'rate-limit';
    
    // In-memory store (use Redis in production)
    this.store = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Generate rate limit key from request
   */
  getKey(req) {
    // Use IP address as key
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Include user ID if authenticated
    const userId = req.user?.id || 'anonymous';
    
    return `${this.keyPrefix}:${userId}:${ip}`;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key) {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now - record.windowStart > this.windowMs) {
      // New window
      this.store.set(key, {
        count: 1,
        windowStart: now
      });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime: now + this.windowMs };
    }

    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.windowStart + this.windowMs,
        retryAfter: record.windowStart + this.windowMs - now
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetTime: record.windowStart + this.windowMs
    };
  }

  /**
   * Clean up old records
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now - record.windowStart > this.windowMs * 2) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Middleware function
   */
  middleware(req, res, next) {
    const key = this.getKey(req);
    const result = this.isAllowed(key);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      res.setHeader('Retry-After', Math.ceil(result.retryAfter / 1000));
      return res.status(429).json({
        success: false,
        error: this.message,
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil(result.retryAfter / 1000)
      });
    }

    // Add rate limit info to request for logging
    req.rateLimit = {
      remaining: result.remaining,
      limit: this.maxRequests
    };

    next();
  }
}

/**
 * Create rate limiter middleware
 */
function rateLimit(options = {}) {
  const limiter = new RateLimiter(options);
  return limiter.middleware.bind(limiter);
}

/**
 * Different rate limit configurations for different endpoints
 */
const rateLimits = {
  // Strict: Authentication endpoints
  auth: {
    windowMs: 60000, // 1 minute
    maxRequests: 5, // 5 attempts per minute
    message: 'Too many authentication attempts'
  },

  // Moderate: Write operations
  write: {
    windowMs: 60000, // 1 minute
    maxRequests: 20, // 20 requests per minute
    message: 'Too many write requests'
  },

  // Standard: Read operations
  read: {
    windowMs: 60000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Too many requests'
  },

  // Relaxed: Health checks
  health: {
    windowMs: 60000,
    maxRequests: 300,
    message: 'Too many requests'
  }
};

module.exports = {
  rateLimit,
  rateLimits,
  RateLimiter
};
