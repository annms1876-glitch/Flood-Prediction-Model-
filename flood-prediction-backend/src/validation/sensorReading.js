// Sensor Reading Validation
// Validates and sanitizes sensor reading input data

import { body, validationResult } from 'express-validator';

/**
 * Validation rules for sensor reading input
 */
export const validateSensorReading = [
  // Location is required
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Location contains invalid characters'),

  // Rainfall (optional) - must be non-negative
  body('rainfall_mm')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 500 })
    .withMessage('Rainfall must be between 0 and 500 mm')
    .toFloat(),

  // Water level (optional) - must be non-negative
  body('water_level_m')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Water level must be between 0 and 100 meters')
    .toFloat(),

  // Soil moisture (optional) - must be 0-100
  body('soil_moisture_percent')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Soil moisture must be between 0 and 100 percent')
    .toFloat(),

  // Tilt degrees (optional) - can be negative
  body('tilt_degrees')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Tilt must be between -90 and 90 degrees')
    .toFloat(),

  // Temperature (optional) - realistic range
  body('temperature_c')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: -50, max: 60 })
    .withMessage('Temperature must be between -50 and 60 Celsius')
    .toFloat(),

  // Humidity (optional) - must be 0-100
  body('humidity_percent')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be between 0 and 100 percent')
    .toFloat(),

  // Timestamp (optional) - must be valid ISO 8601
  body('recorded_at')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid timestamp format. Use ISO 8601 format (e.g., 2026-09-06T10:30:00Z)')
    .custom((value) => {
      // Ensure timestamp is not in the future
      const parsedDate = new Date(value);
      const now = new Date();
      if (parsedDate > now) {
        throw new Error('Timestamp cannot be in the future');
      }
      return true;
    }),

  // Handle validation errors
  (req, res, next) => {
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
];

/**
 * Sanitize sensor reading data
 */
export function sanitizeSensorReading(data) {
  const sanitized = {};

  // Only include allowed fields
  const allowedFields = [
    'location',
    'rainfall_mm',
    'water_level_m',
    'soil_moisture_percent',
    'tilt_degrees',
    'temperature_c',
    'humidity_percent',
    'recorded_at'
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined && data[field] !== null) {
      sanitized[field] = data[field];
    }
  }

  // Trim location string
  if (sanitized.location) {
    sanitized.location = sanitized.location.trim();
  }

  // Round numeric values to reasonable precision
  if (sanitized.rainfall_mm !== undefined) {
    sanitized.rainfall_mm = Math.round(sanitized.rainfall_mm * 100) / 100;
  }
  if (sanitized.water_level_m !== undefined) {
    sanitized.water_level_m = Math.round(sanitized.water_level_m * 1000) / 1000;
  }
  if (sanitized.soil_moisture_percent !== undefined) {
    sanitized.soil_moisture_percent = Math.round(sanitized.soil_moisture_percent * 100) / 100;
  }
  if (sanitized.tilt_degrees !== undefined) {
    sanitized.tilt_degrees = Math.round(sanitized.tilt_degrees * 100) / 100;
  }
  if (sanitized.temperature_c !== undefined) {
    sanitized.temperature_c = Math.round(sanitized.temperature_c * 100) / 100;
  }
  if (sanitized.humidity_percent !== undefined) {
    sanitized.humidity_percent = Math.round(sanitized.humidity_percent * 100) / 100;
  }

  return sanitized;
}

/**
 * Validate partial sensor reading (for updates)
 */
export const validatePartialSensorReading = [
  // At least one field must be provided
  body()
    .custom((value, { req }) => {
      const sensorFields = [
        'location',
        'rainfall_mm',
        'water_level_m',
        'soil_moisture_percent',
        'tilt_degrees',
        'temperature_c',
        'humidity_percent',
        'recorded_at'
      ];
      const hasValidFields = sensorFields.some(field => req.body[field] !== undefined && req.body[field] !== null);
      if (!hasValidFields) {
        throw new Error('At least one sensor reading field must be provided');
      }
      return true;
    }),

  // Same validation rules as full reading (for fields that are provided)
  body('location')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be between 1 and 100 characters'),

  body('rainfall_mm')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 500 })
    .withMessage('Rainfall must be between 0 and 500 mm'),

  body('water_level_m')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Water level must be between 0 and 100 meters'),

  body('soil_moisture_percent')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Soil moisture must be between 0 and 100 percent'),

  body('tilt_degrees')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Tilt must be between -90 and 90 degrees'),

  body('temperature_c')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: -50, max: 60 })
    .withMessage('Temperature must be between -50 and 60 Celsius'),

  body('humidity_percent')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be between 0 and 100 percent'),

  body('recorded_at')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid timestamp format'),

  (req, res, next) => {
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
];

/**
 * Get validation error messages in human-readable format
 */
export function getValidationMessages(errors) {
  const messages = [];

  for (const error of errors) {
    switch (error.path) {
      case 'location':
        messages.push('Location is invalid or missing');
        break;
      case 'rainfall_mm':
        messages.push('Rainfall must be between 0 and 500 mm');
        break;
      case 'water_level_m':
        messages.push('Water level must be between 0 and 100 meters');
        break;
      case 'soil_moisture_percent':
        messages.push('Soil moisture must be between 0 and 100%');
        break;
      case 'tilt_degrees':
        messages.push('Tilt must be between -90 and 90 degrees');
        break;
      case 'temperature_c':
        messages.push('Temperature must be between -50 and 60°C');
        break;
      case 'humidity_percent':
        messages.push('Humidity must be between 0 and 100%');
        break;
      case 'recorded_at':
        messages.push('Invalid timestamp format or timestamp is in the future');
        break;
      default:
        messages.push(error.msg);
    }
  }

  return messages;
}
