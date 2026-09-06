# Security Documentation

This document outlines the security measures implemented in the Flood Prediction Backend and best practices for deployment.

## 🔒 Security Features Implemented

### 1. Authentication & Authorization
- **JWT-based authentication** for protected endpoints
- **Token expiration** with configurable TTL (default: 24h)
- **Role-based access control** (optional)
- **Token refresh** mechanism

### 2. Rate Limiting
- **Global rate limiting** (100 requests/minute default)
- **Endpoint-specific limits**:
  - Auth endpoints: 5 requests/minute
  - Write operations: 20 requests/minute
  - Read operations: 100 requests/minute
  - Health checks: 300 requests/minute
- **IP-based tracking** with automatic cleanup

### 3. Input Validation & Sanitization
- **Express Validator** for request validation
- **Schema-based validation** for all endpoints
- **XSS sanitization** (xss-clean)
- **SQL injection prevention** (parameterized queries via Supabase)
- **Input length limits** to prevent buffer overflow

### 4. Security Headers (Helmet)
- **Content Security Policy (CSP)** - Prevents XSS and data injection
- **X-Content-Type-Options: nosniff** - Prevents MIME-type sniffing
- **X-Frame-Options: DENY** - Prevents clickjacking
- **Strict-Transport-Security (HSTS)** - Enforces HTTPS (production)
- **Referrer-Policy** - Controls referrer information
- **Permissions-Policy** - Restricts browser feature access
- **Cache-Control: no-store** - Prevents caching of sensitive data

### 5. CORS (Cross-Origin Resource Sharing)
- **Explicit origin whitelist** (no wildcard in production)
- **Limited HTTP methods** (GET, POST, PUT, DELETE, OPTIONS)
- **Restricted headers** - Only necessary headers allowed
- **Credentials support** for authenticated requests

### 6. Request Logging
- **Sensitive data masking** in logs
- **Masked fields**: password, token, authorization, api_key, secret, key
- **Configurable log levels** (debug, info, warn, error)
- **Request tracing** with request IDs

### 7. Error Handling
- **Generic error messages** in production (no stack traces)
- **Error codes** for client-side handling
- **Sensitive data exclusion** from error responses

### 8. Dependencies
- **Regular updates** via npm audit
- **Minimal dependencies** - only what's needed
- **Known vulnerabilities monitoring**

## 🛡️ Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | default-src 'self' | Prevent XSS, data injection |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| Strict-Transport-Security | max-age=31536000 | Enforce HTTPS (prod) |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer info |
| Permissions-Policy | camera=(), microphone=() | Disable unused features |
| Cache-Control | no-store, no-cache | Prevent caching |

## 🔑 Environment Variables for Security

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret key for JWT tokens (32+ chars) |
| `JWT_EXPIRES_IN` | No | Token expiration (default: 24h) |
| `API_KEY` | No | API key for server-to-server auth |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins |
| `ALLOWED_METHODS` | No | Allowed HTTP methods |
| `ALLOWED_HEADERS` | No | Allowed CORS headers |
| `RATE_LIMIT_ENABLED` | No | Enable/disable rate limiting |
| `RATE_LIMIT_MAX` | No | Max requests per window |
| `RATE_LIMIT_WINDOW` | No | Rate limit window (ms) |
| `TRUSTED_PROXIES` | No | Trusted proxy IPs for rate limiting |

## 🔐 Authentication Setup

### Generate JWT Secret

```bash
# Generate a secure random secret (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Using Authentication Middleware

```javascript
const { authenticate } = require('./middleware/auth');

// Protect a route
app.post('/api/protected', 
  authenticate({ jwtSecret: process.env.JWT_SECRET }),
  (req, res) => {
    res.json({ user: req.user, data: 'protected data' });
  }
);

// Role-based access
app.post('/api/admin', 
  authenticate({ 
    jwtSecret: process.env.JWT_SECRET,
    roles: ['admin'] 
  }),
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);
```

### Generating Tokens

```javascript
const { generateToken } = require('./middleware/auth');

const token = generateToken({
  userId: 'user-123',
  email: 'user@example.com',
  role: 'user'
}, {
  expiresIn: '24h',
  jwtSecret: process.env.JWT_SECRET
});
```

## 📍 Input Validation Examples

### Sensor Reading Validation

```javascript
const { validateSensorReading } = require('./middleware/validation');

app.post('/api/sensors/readings',
  validateSensorReading,
  (req, res) => {
    // req.body is validated and sanitized
    res.json({ success: true, data: req.body });
  }
);
```

### Validation Rules Included

| Field | Rules |
|-------|-------|
| sensor_id | UUID format required |
| water_level | Float, 0-100 meters |
| rainfall | Float, 0-500 mm |
| soil_moisture | Float, 0-100% |
| temperature | Float, -50 to 60°C |
| location | String, max 100 chars |
| risk_score | Integer, 0-100 |
| risk_level | Enum: normal, watch, warning, high, critical |

## 🚦 Rate Limiting Configuration

### Default Settings (in .env)

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000  # 1 minute
```

### Custom Rate Limits

```javascript
const { rateLimit, rateLimits } = require('./middleware/security');

// Stricter limits for API keys
app.use('/api/internal/', rateLimit({
  windowMs: 60000,
  maxRequests: 10,
  message: 'Too many internal requests'
}));
```

## 🌐 CORS Configuration

### Development (.env)

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://127.0.0.1:3000
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
ALLOWED_HEADERS=Origin,X-Requested-With,Content-Type,Accept,Authorization
```

### Production (.env)

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
ALLOWED_HEADERS=Origin,X-Requested-With,Content-Type,Accept,Authorization,X-API-Key
```

## 🔒 Production Deployment Checklist

### 1. Environment Variables
- [ ] Set strong `JWT_SECRET` (64+ character random hex)
- [ ] Configure `ALLOWED_ORIGINS` with actual domains
- [ ] Set `NODE_ENV=production`
- [ ] Configure `TRUSTED_PROXIES` if behind CDN

### 2. HTTPS/TLS
- [ ] Enable HTTPS (use reverse proxy like nginx)
- [ ] Configure HSTS in production
- [ ] Use valid SSL certificates

### 3. Database Security
- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Use service_role key only server-side
- [ ] Never expose anon key in browser
- [ ] Set up database backups

### 4. Firebase Security
- [ ] Restrict Firebase Admin SDK to backend only
- [ ] Configure Firestore security rules
- [ ] Rotate service account keys periodically
- [ ] Limit service account IAM permissions

### 5. Monitoring & Logging
- [ ] Enable structured logging (JSON format for production)
- [ ] Set up log aggregation (ELK, Datadog, etc.)
- [ ] Monitor for suspicious activity
- [ ] Alert on rate limit violations

### 6. Regular Maintenance
- [ ] Run `npm audit` regularly
- [ ] Update dependencies monthly
- [ ] Rotate JWT secrets quarterly
- [ ] Review and update CORS origins
- [ ] Review API key usage

## 🐛 Security Vulnerability Response

### If a vulnerability is discovered:

1. **Contain**: Disable affected endpoints or increase rate limits
2. **Assess**: Determine scope and impact
3. **Fix**: Patch the vulnerability
4. **Communicate**: Notify affected users if necessary
5. **Document**: Update security documentation

### Reporting Issues

Do NOT report security vulnerabilities publicly. Instead:
- Email the maintainer directly
- Use private security reporting channels
- Allow reasonable time for fixes before disclosure

## 📊 Security Audit Commands

### Check for vulnerable dependencies

```bash
npm audit
npm audit fix
```

### Check JWT secret strength

```bash
# Should be 64+ characters
echo -n "$JWT_SECRET" | wc -c
```

### Test rate limiting

```bash
# Send rapid requests to test rate limiting
for i in {1..10}; do curl http://localhost:3000/api/health; done
```

### Verify security headers

```bash
curl -I http://localhost:3000/api/health | grep -i "x-"
```

## 🔐 API Security Best Practices

1. **Always use HTTPS** in production
2. **Validate all inputs** on the server side
3. **Implement rate limiting** to prevent abuse
4. **Use authentication** for sensitive operations
5. **Set appropriate CORS** policies
6. **Log security events** for audit trail
7. **Keep dependencies updated**
8. **Rotate credentials regularly**
9. **Use environment variables** for secrets
10. **Implement request tracing** for debugging

## 📞 Security Contact

For security issues or questions:
- Check existing documentation
- Review security middleware implementations
- Test endpoints with security scanning tools

---

**Remember:** Security is an ongoing process, not a one-time setup. Regularly review and update your security measures.
