// Rate Limiting Middleware
// Simple in-memory rate limiter (use Redis for production)

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute default
    this.maxRequests = options.maxRequests || 100;
    this.message = options.message || 'Too many requests, please try again later';
    this.keyPrefix = options.keyPrefix || 'rl';
    
    // In-memory store
    this.store = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  getKey(req) {
    // Use IP address
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    // Include user ID if authenticated
    const userId = req.user?.id || 'anonymous';
    return `${this.keyPrefix}:${userId}:${ip}`;
  }

  isAllowed(key) {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now - record.start > this.windowMs) {
      this.store.set(key, {
        count: 1,
        start: now
      });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime: now + this.windowMs };
    }

    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.start + this.windowMs
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetTime: record.start + this.windowMs
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now - record.start > this.windowMs * 2) {
        this.store.delete(key);
      }
    }
  }
}

// Global rate limiter
const globalRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100')
});

/**
 * Rate limiting middleware
 */
function rateLimitMiddleware(req, res, next) {
  const key = globalRateLimiter.getKey(req);
  const result = globalRateLimiter.isAllowed(key);

  res.setHeader('X-RateLimit-Limit', globalRateLimiter.maxRequests);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  if (!result.allowed) {
    res.setHeader('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000));
    return res.status(429).json({
      success: false,
      error: globalRateLimiter.message,
      code: 'RATE_LIMITED',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      timestamp: new Date().toISOString()
    });
  }

  next();
}

/**
 * Stricter rate limiter for auth endpoints
 */
const authRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5')
});

function authRateLimitMiddleware(req, res, next) {
  const key = globalRateLimiter.getKey(req);
  const result = authRateLimiter.isAllowed(key);

  if (!result.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again later.',
      code: 'AUTH_RATE_LIMITED',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
    });
  }

  next();
}

module.exports = {
  rateLimitMiddleware,
  authRateLimitMiddleware,
  RateLimiter
};
