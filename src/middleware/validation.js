// Input Validation Middleware
// Validates and sanitizes incoming request data

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation error handler middleware
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
}

/**
 * Sensor reading validation rules
 */
const validateSensorReading = [
  body('sensor_id')
    .trim()
    .notEmpty()
    .withMessage('Sensor ID is required')
    .isUUID()
    .withMessage('Invalid sensor ID format'),

  body('water_level')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Water level must be between 0 and 100 meters'),

  body('rainfall')
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage('Rainfall must be between 0 and 500 mm'),

  body('soil_moisture')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Soil moisture must be between 0 and 100%'),

  body('temperature')
    .optional()
    .isFloat({ min: -50, max: 60 })
    .withMessage('Temperature must be between -50 and 60°C'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),

  body('recorded_at')
    .optional()
    .isISO8601()
    .withMessage('Invalid timestamp format'),

  handleValidationErrors
];

/**
 * Prediction validation rules
 */
const validatePrediction = [
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 100 }),

  body('risk_score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Risk score must be between 0 and 100'),

  body('risk_level')
    .optional()
    .isIn(['normal', 'watch', 'warning', 'high', 'critical'])
    .withMessage('Invalid risk level'),

  body('water_level')
    .optional()
    .isFloat({ min: 0, max: 100 }),

  body('confidence')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Confidence must be between 0 and 100%'),

  body('model_version')
    .optional()
    .matches(/^v\d+\.\d+\.\d+$/)
    .withMessage('Model version must follow format vX.Y.Z'),

  handleValidationErrors
];

/**
 * Alert sending validation rules
 */
const validateAlert = [
  body('tokens')
    .isArray()
    .withMessage('Tokens must be an array')
    .custom((tokens) => {
      if (tokens.length > 1000) {
        throw new Error('Cannot send to more than 1000 devices at once');
      }
      return true;
    }),

  body('tokens.*')
    .trim()
    .notEmpty()
    .withMessage('Token cannot be empty')
    .isLength({ min: 10, max: 500 })
    .withMessage('Invalid token length'),

  body('alert_data')
    .isObject()
    .withMessage('Alert data must be an object'),

  body('alert_data.risk_level')
    .optional()
    .isIn(['normal', 'watch', 'warning', 'high', 'critical'])
    .withMessage('Invalid risk level'),

  body('alert_data.location')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  body('alert_data.message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message too long (max 500 characters)'),

  handleValidationErrors
];

/**
 * Query parameter validation for pagination
 */
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be positive'),

  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be asc or desc'),

  handleValidationErrors
];

/**
 * Sanitize string input
 */
function sanitizeString(input, maxLength = 100) {
  if (typeof input !== 'string') return input;
  return input.trim().substring(0, maxLength);
}

/**
 * Sanitize object input
 */
function sanitizeObject(obj, schema) {
  const result = {};

  for (const [key, rules] of Object.entries(schema)) {
    if (obj[key] !== undefined) {
      let value = obj[key];

      if (rules.trim && typeof value === 'string') {
        value = value.trim();
      }

      if (rules.maxLength && typeof value === 'string') {
        value = value.substring(0, rules.maxLength);
      }

      if (rules.type === 'number' && typeof value === 'string') {
        value = parseFloat(value);
      }

      result[key] = value;
    }
  }

  return result;
}

/**
 * Validate JWT token format (without verifying)
 */
function validateTokenFormat(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    // Check if header and payload are valid base64
    Buffer.from(parts[0], 'base64').toString();
    Buffer.from(parts[1], 'base64').toString();
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  handleValidationErrors,
  validateSensorReading,
  validatePrediction,
  validateAlert,
  validatePagination,
  sanitizeString,
  sanitizeObject,
  validateTokenFormat
};
