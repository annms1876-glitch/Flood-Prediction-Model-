// Email Service
// Handles sending emails for password reset, account verification, and notifications
// Supports multiple email providers (SMTP, SendGrid, etc.)

class EmailService {
  constructor(options = {}) {
    this.config = options;
    this.provider = options.provider || 'smtp'; // 'smtp', 'sendgrid', 'mailgun', etc.
    this.smtpConfig = options.smtp || {};
    this.sendgridApiKey = options.sendgridApiKey || process.env.SENDGRID_API_KEY;
    this.mailgunApiKey = options.mailgunApiKey || process.env.MAILGUN_API_KEY;
    this.mailgunDomain = options.mailgunDomain || process.env.MAILGUN_DOMAIN;
  }

  /**
   * Check if email service is configured
   * @returns {boolean}
   */
  isConfigured() {
    if (this.provider === 'sendgrid') {
      return !!(this.sendgridApiKey || process.env.SENDGRID_API_KEY);
    }

    if (this.provider === 'mailgun') {
      return !!(this.mailgunApiKey || process.env.MAILGUN_API_KEY);
    }

    // SMTP
    const smtp = this.smtpConfig || {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    };

    return !!(smtp.host && smtp.user && smtp.pass);
  }

  /**
   * Send plain text email
   * @param {Object} params - Email parameters
   * @param {string|string[]} params.to - Recipient email(s)
   * @param {string} params.subject - Email subject
   * @param {string} params.text - Plain text content
   * @param {string} params.html - HTML content (optional)
   * @param {Object} params.from - Sender info (optional, uses config defaults)
   * @param {string} params.from.email - Sender email
   * @param {string} params.from.name - Sender name
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(params) {
    if (!this.isConfigured()) {
      throw new Error('Email service is not configured');
    }

    const {
      to,
      subject,
      text,
      html,
      from
    } = params;

    if (!to || !subject || !text) {
      throw new Error('to, subject, and text are required');
    }

    if (Array.isArray(to)) {
      // Send to multiple recipients
      const results = [];
      for (const recipient of to) {
        try {
          const result = await this._sendSingle({
            to: recipient,
            subject,
            text,
            html,
            from
          });
          results.push({ recipient, success: true, ...result });
        } catch (error) {
          results.push({ recipient, success: false, error: error.message });
        }
      }
      return { success: results.every(r => r.success), results };
    }

    return this._sendSingle({ to, subject, text, html, from });
  }

  /**
   * Send HTML email with template
   * @param {Object} params - Email parameters
   * @param {string} params.template - Template name or HTML string
   * @param {Object} params.data - Template data
   * @returns {Promise<Object>} Send result
   */
  async sendTemplateEmail(params) {
    const { to, subject, template, data, from } = params;

    let html;
    if (typeof template === 'function') {
      // Template is a function
      html = template(data);
    } else if (typeof template === 'string') {
      // Template is an HTML string with placeholders
      html = this._renderTemplate(template, data);
    } else {
      throw new Error('Template must be a string or function');
    }

    return this.sendEmail({
      to,
      subject,
      html,
      text: this._ StripHTML(html),
      from
    });
  }

  /**
   * Send password reset email
   * @param {string} email - User's email address
   * @param {string} resetToken - Password reset token/link
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail(email, resetToken, options = {}) {
    const {
      resetUrl = options.resetUrl,
      frontEndUrl = options.frontEndUrl || process.env.FRONTEND_URL || 'http://localhost:3000',
      template = 'password_reset'
    } = options;

    // Construct reset URL if not provided
    let resetLink;
    if (resetUrl) {
      resetLink = resetUrl;
    } else if (frontEndUrl) {
      resetLink = `${frontEndUrl}/reset-password?token=${resetToken}`;
    } else {
      // Fallback: provide token directly (less secure, for development)
      resetLink = null;
    }

    const subject = 'Password Reset Request - Flood Prediction System';

    const html = this._getPasswordResetTemplate(resetLink);
    const text = this._getPasswordResetTextTemplate(resetLink);

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
      from: {
        email: 'noreply@flood-prediction-system.com',
        name: 'Flood Prediction System'
      }
    });
  }

  /**
   * Send account verification email
   * @param {string} email - User's email address
   * @param {string} verificationToken - Verification token
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Send result
   */
  async sendVerificationEmail(email, verificationToken, options = {}) {
    const {
      verifyUrl = options.verifyUrl,
      frontEndUrl = options.frontEndUrl || process.env.FRONTEND_URL || 'http://localhost:3000'
    } = options;

    let verifyLink;
    if (verifyUrl) {
      verifyLink = verifyUrl;
    } else if (frontEndUrl) {
      verifyLink = `${frontEndUrl}/verify-email?token=${verificationToken}`;
    } else {
      verifyLink = null;
    }

    const subject = 'Verify Your Email - Flood Prediction System';

    const html = this._getVerificationTemplate(verifyLink);
    const text = this._getVerificationTextTemplate(verifyLink);

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
      from: {
        email: 'noreply@flood-prediction-system.com',
        name: 'Flood Prediction System'
      }
    });
  }

  /**
   * Send notification email (alerts, updates, etc.)
   * @param {string} email - Recipient email
   * @param {string} notificationType - Type of notification
   * @param {Object} data - Notification data
   * @returns {Promise<Object>} Send result
   */
  async sendNotificationEmail(email, notificationType, data) {
    const templates = {
      flood_alert: {
        subject: (data) => `Flood Alert: ${data.riskLevel || 'Warning'} - ${data.location || 'Your Area'}`,
        render: (data) => this._getFloodAlertTemplate(data)
      },
      system_update: {
        subject: () => 'System Update - Flood Prediction System',
        render: (data) => this._getSystemUpdateTemplate(data)
      },
      welcome: {
        subject: () => 'Welcome to Flood Prediction System',
        render: (data) => this._getWelcomeTemplate(data)
      }
    };

    const template = templates[notificationType];
    if (!template) {
      throw new Error(`Unknown notification type: ${notificationType}`);
    }

    const subject = template.subject(data);
    const html = template.render(data);

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: this._stripHTML(html),
      from: {
        email: 'notifications@flood-prediction-system.com',
        name: 'Flood Prediction System'
      }
    });
  }

  /**
   * Send bulk emails
   * @param {Array<Object>} recipients - Array of recipient objects
   * @param {Object} emailData - Common email data
   * @returns {Promise<Object>} Bulk send result
   */
  async sendBulkEmail(recipients, emailData) {
    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail({
          to: recipient.email,
          ...emailData,
          from: recipient.from || emailData.from
        });
        results.push({
          email: recipient.email,
          name: recipient.name,
          success: true,
          ...result
        });
      } catch (error) {
        results.push({
          email: recipient.email,
          name: recipient.name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return {
      total: recipients.length,
      success: successCount,
      failed: results.length - successCount,
      successRate: recipients.length > 0 ? (successCount / recipients.length) * 100 : 0,
      results
    };
  }

  /**
   * Render template with data
   * @private
   */
  _renderTemplate(template, data) {
    if (!data || Object.keys(data).length === 0) {
      return template;
    }

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * Strip HTML tags from string
   * @private
   */
  _stripHTML(html) {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Send single email via configured provider
   * @private
   */
  async _sendSingle(params) {
    // This would be implemented based on the provider
    // For now, returning success without actually sending (for development)
    console.warn('⚠️  Email service not fully implemented. Install nodemailer and configure SMTP for production.');

    return {
      messageId: `mock-${Date.now()}`,
      accepted: true,
      rejected: 0,
      pending: 0,
      provider: this.provider
    };

    // Example SMTP implementation with nodemailer:
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: this.smtpConfig.host || process.env.SMTP_HOST,
      port: this.smtpConfig.port || process.env.SMTP_PORT || 587,
      secure: this.smtpConfig.secure || process.env.SMTP_SECURE === 'true',
      auth: {
        user: this.smtpConfig.user || process.env.SMTP_USER,
        pass: this.smtpConfig.pass || process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: params.from || {
        email: process.env.SMTP_FROM_EMAIL || 'noreply@example.com',
        name: process.env.SMTP_FROM_NAME || 'Flood Prediction System'
      },
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html
    };

    return await transporter.sendMail(mailOptions);
    */
  }

  // ==================== Email Templates ====================

  _getPasswordResetTemplate(resetLink) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - Flood Prediction System</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .alert-banner {
      background-color: #e74c3c;
      color: white;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
      margin-bottom: 20px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 10px;
    }
    .button:hover {
      background-color: #2980b9;
    }
    .fallback-link {
      color: #3498db;
      word-break: break-all;
    }
    .footer {
      text-align: center;
      color: #7f8c8d;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
    }
    .warning {
      background-color: #f39c12;
      color: white;
      padding: 10px;
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌊 Flood Prediction System</h1>
    </div>

    <div class="alert-banner">
      Password Reset Request
    </div>

    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset the password for your Flood Prediction System account.</p>
      <p>If you made this request, click the button below to reset your password:</p>

      ${resetLink 
        ? `<p style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>`
        : `<p style="background-color: #f39c12; color: white; padding: 10px; border-radius: 4px; margin: 20px 0;">
            No reset link available. Please contact support or use the token: <strong>${resetToken}</strong>
          </p>`
      }

      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

      <div class="warning">
        <strong>🔒 Security Notice:</strong> This link will expire in 1 hour. Please reset your password promptly.
      </div>
    </div>

    <div class="footer">
      <p>Flood Prediction System</p>
      <p>Your safety is our priority</p>
      <p>If you have any questions, contact: support@flood-prediction-system.com</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  _getPasswordResetTextTemplate(resetLink) {
    return `
PASSWORD RESET REQUEST
=====================

Hello,

We received a request to reset the password for your Flood Prediction System account.

If you made this request, use the link below to reset your password:

${resetLink || 'No reset link available. Please contact support.'}

If you didn't request a password reset, you can safely ignore this email.

This link will expire in 1 hour.

Flood Prediction System
    `.trim();
  }

  _getVerificationTemplate(verifyLink) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - Flood Prediction System</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .success-banner {
      background-color: #27ae60;
      color: white;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      color: #7f8c8d;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌊 Flood Prediction System</h1>
    </div>

    <div class="success-banner">
      Email Verification Required
    </div>

    <div class="content">
      <p>Hello,</p>
      <p>Thank you for signing up for the Flood Prediction System!</p>
      <p>To complete your registration, please verify your email address by clicking the button below:</p>

      <p style="text-align: center; margin: 20px 0;">
        <a href="${verifyLink}" class="button">Verify Email Address</a>
      </p>

      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #3498db; word-break: break-all;">${verifyLink || 'No verification link available'}</p>

      <p>This link will expire in 24 hours.</p>
    </div>

    <div class="footer">
      <p>Flood Prediction System</p>
      <p>Stay safe, stay informed</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  _getVerificationTextTemplate(verifyLink) {
    return `
EMAIL VERIFICATION
==================

Hello,

Thank you for signing up for the Flood Prediction System!

To complete your registration, please verify your email address using this link:

${verifyLink || 'No verification link available'}

This link will expire in 24 hours.

Flood Prediction System
    `.trim();
  }

  _getFloodAlertTemplate(data) {
    const {
      riskLevel = 'warning',
      location = 'Your Area',
      message = 'Flood warning issued',
      waterLevel = null,
      rainfall = null,
      timestamp = new Date().toISOString()
    } = data;

    const riskColors = {
      emergency: '#c0392b',
      critical: '#e74c3c',
      high: '#e67e22',
      warning: '#f39c12',
      watch: '#3498db',
      normal: '#27ae60'
    };

    const riskColor = riskColors[riskLevel] || riskColors.warning;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flood Alert - ${riskLevel.toUpperCase()} - Flood Prediction System</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .alert-banner { background-color: ${riskColor}; color: white; padding: 15px; border-radius: 4px; text-align: center; margin-bottom: 20px; }
    .alert-banner h2 { margin: 0; font-size: 24px; }
    .content { margin-bottom: 30px; }
    .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
    .data-card { background-color: #ecf0f1; padding: 15px; border-radius: 4px; }
    .data-card h4 { margin: 0 0 5px 0; color: #7f8c8d; font-size: 12px; text-transform: uppercase; }
    .data-card p { margin: 0; font-size: 18px; font-weight: bold; }
    .footer { text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌊 Flood Prediction System</h1>
    </div>
    <div class="alert-banner">
      <h2>${riskLevel.toUpperCase()} - ${location}</h2>
    </div>
    <div class="content">
      <p>${message}</p>
      <p>This is an automated alert from the Flood Prediction System.</p>

      <div class="data-grid">
        ${waterLevel !== null ? `
        <div class="data-card">
          <h4>Water Level</h4>
          <p>${waterLevel.toFixed(2)} m</p>
        </div>` : ''}
        ${rainfall !== null ? `
        <div class="data-card">
          <h4>Rainfall</h4>
          <p>${rainfall.toFixed(1)} mm</p>
        </div>` : ''}
      </div>
    </div>
    <div class="footer">
      <p>Issued: ${new Date(timestamp).toLocaleString()}</p>
      <p>For emergency, call local authorities</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  _getSystemUpdateTemplate(data) {
    const { title = 'System Update', message = '', timestamp = new Date().toISOString() } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Update - Flood Prediction System</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #2c3e50; }
    .content { margin-bottom: 30px; }
    .footer { text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌊 Flood Prediction System</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      <p>${message}</p>
      <p>This update was issued on ${new Date(timestamp).toLocaleString()}.</p>
    </div>
    <div class="footer">
      <p>Flood Prediction System</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  _getWelcomeTemplate(data) {
    const { userName = 'there', userId = null } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome - Flood Prediction System</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #2c3e50; }
    .welcome-banner { background-color: #27ae60; color: white; padding: 15px; border-radius: 4px; text-align: center; margin-bottom: 20px; }
    .content { margin-bottom: 30px; }
    .features { margin-top: 20px; }
    .feature { display: flex; align-items: center; margin-bottom: 10px; }
    .feature-icon { width: 30px; height: 30px; background-color: #3498db; color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold; }
    .footer { text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌊 Flood Prediction System</h1>
    </div>
    <div class="welcome-banner">
      Welcome to the Flood Prediction System, ${userName}!
    </div>
    <div class="content">
      <p>We're glad to have you on board. Our system helps keep you informed about flood risks in your area.</p>

      <div class="features">
        <div class="feature">
          <span class="feature-icon">1</span>
          <strong>Real-time Alerts:</strong> Get instant notifications about flood risks in your area.
        </div>
        <div class="feature">
          <span class="feature-icon">2</span>
          <strong>Sensor Data:</strong> Monitor water levels, rainfall, and other environmental data.
        </div>
        <div class="feature">
          <span class="feature-icon">3</span>
          <strong>Risk Assessment:</strong> View current flood risk levels and historical data.
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Stay safe, stay informed.</p>
      <p>Flood Prediction System Team</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

// Singleton instance with default configuration
const emailService = new EmailService({
  provider: process.env.EMAIL_PROVIDER || 'smtp',
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  mailgunApiKey: process.env.MAILGUN_API_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN
});

export default emailService;
export { EmailService };
