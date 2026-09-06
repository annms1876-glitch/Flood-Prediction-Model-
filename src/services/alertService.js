// Alert Notification Service
// Sends alerts when flood risk reaches certain thresholds
// Supports multiple channels: email, console, webhook, future push notifications

class AlertService {
  constructor(options = {}) {
    this.options = options;
    
    // Alert thresholds
    this.thresholds = {
      warning: options.warningLevel || 40,    // Risk score to trigger warning
      high: options.highLevel || 60,          // Risk score to trigger high alert
      critical: options.criticalLevel || 80,  // Risk score to trigger critical alert
      rapidChange: options.rapidChangeThreshold || 20 // Risk score change to trigger alert
    };
    
    // Enable/disable alert channels
    this.channels = {
      console: options.consoleAlerts !== false,
      email: options.emailAlerts !== false,
      webhook: options.webhookAlerts !== false,
      push: options.pushAlerts !== false  // For future Firebase push
    };
    
    // Webhook configuration
    this.webhookUrl = options.webhookUrl || process.env.ALERT_WEBHOOK_URL;
    
    // Warn about missing email configuration
    if (this.channels.email && !process.env.SMTP_HOST) {
      console.warn('⚠️  Email alerts enabled but SMTP not configured. Set SMTP_HOST in .env');
    }
  }

  /**
   * Send an alert
   * @param {Object} alertData - Alert information
   * @param {string} alertData.location - Location
   * @param {number} alertData.risk_score - Current risk score
   * @param {string} alertData.risk_level - Risk level
   * @param {string} alertData.message - Alert message
   * @param {string} alertData.priority - Alert priority (low, medium, high, emergency)
   */
  async sendAlert(alertData) {
    const {
      location,
      risk_score,
      risk_level,
      message,
      priority = 'medium'
    } = alertData;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚨 FLOOD ALERT - ${risk_level.toUpperCase()} - ${location}`);
    console.log(`='.repeat(60)`);
    console.log(`Risk Score: ${risk_score}/100`);
    console.log(`Message: ${message}`);
    console.log(`Priority: ${priority}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`='.repeat(60)}\n`);

    // Send via configured channels
    const results = {
      console: false,
      email: false,
      webhook: false,
      push: false
    };

    // Console alert (always enabled)
    if (this.channels.console) {
      console.log('📢 CONSOLE ALERT:', {
        location,
        risk_score,
        risk_level,
        message,
        priority
      });
      results.console = true;
    }

    // Email alert
    if (this.channels.email) {
      try {
        const emailService = require('./emailService');
        await emailService.sendNotificationEmail(
          'alerts@flood-prediction-system.com', // Replace with actual alert recipients
          'flood_alert',
          {
            riskLevel: risk_level,
            location,
            message,
            timestamp: new Date().toISOString()
          }
        );
        results.email = true;
      } catch (error) {
        console.error('Failed to send email alert:', error.message);
      }
    }

    // Webhook alert
    if (this.channels.webhook && this.webhookUrl) {
      try {
        // This would use fetch or axios to send webhook
        // For now, just log
        console.log('🔗 WEBHOOK ALERT:', {
          url: this.webhookUrl,
          payload: alertData
        });
        results.webhook = true;
        // const response = await fetch(this.webhookUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(alertData)
        // });
      } catch (error) {
        console.error('Failed to send webhook alert:', error.message);
      }
    }

    // Push notification (future - Firebase)
    if (this.channels.push) {
      try {
        // const pushService = require('./pushNotificationService');
        // await pushService.sendPushNotification(...);
        console.log('📱 Push notification not yet implemented');
      } catch (error) {
        console.error('Failed to send push alert:', error.message);
      }
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      channels_used: Object.entries(results)
        .filter(([_, v]) => v)
        .map(([k]) => k)
    };
  }

  /**
   * Process a risk calculation result and send alerts if needed
   * @param {Object} riskResult - Result from risk calculation
   * @returns {Object} Alert sent status
   */
  async processRiskResult(riskResult) {
    const { risk_score, risk_level, location, recommendations } = riskResult;

    // Always log the risk result
    console.log(`📊 Risk Assessment - ${location}:`);
    console.log(`   Score: ${risk_score}/100 (${risk_level})`);
    console.log(`   Requires Action: ${riskResult.requires_action}`);

    // Send alert based on risk level
    if (risk_level === 'critical') {
      console.log('🚨 CRITICAL ALERT - Sending notifications...');
      const alert = {
        location,
        risk_score,
        risk_level,
        message: recommendations.find(r => r.priority === 'emergency')?.message || `Critical flood risk in ${location}`,
        priority: 'emergency'
      };
      return await this.sendAlert(alert);
    }

    if (risk_level === 'high') {
      console.log('🚨 HIGH ALERT - Sending notifications...');
      const alert = {
        location,
        risk_score,
        risk_level,
        message: recommendations.find(r => r.priority === 'high')?.message || `High flood risk in ${location}`,
        priority: 'high'
      };
      return await this.sendAlert(alert);
    }

    if (risk_level === 'warning' && this.thresholds.warning >= 40) {
      console.log('⚠️ WARNING ALERT - Conditions should be monitored');
      const alert = {
        location,
        risk_score,
        risk_level,
        message: recommendations.find(r => r.priority === 'medium')?.message || `Warning conditions in ${location}`,
        priority: 'medium'
      };
      return await this.sendAlert(alert);
    }

    // No alert needed
    return {
      success: true,
      alert_sent: false,
      reason: 'Risk level does not require alert',
      risk_level
    };
  }

  /**
   * Check for rapid risk changes and send alerts
   * @param {Object} currentRisk - Current risk result
   * @param {Object} previousRisk - Previous risk result (optional)
   * @returns {Object|null} Alert if rapid change detected, null otherwise
   */
  checkRapidChange(currentRisk, previousRisk = null) {
    if (!previousRisk) {
      return null;
    }

    const riskChange = currentRisk.risk_score - previousRisk.risk_score;
    const absoluteChange = Math.abs(riskChange);

    if (absoluteChange >= this.thresholds.rapidChange) {
      const direction = riskChange > 0 ? 'increasing' : 'decreasing';
      const alert = {
        location: currentRisk.location,
        risk_score: currentRisk.risk_score,
        risk_level: currentRisk.risk_level,
        previous_risk_score: previousRisk.risk_score,
        previous_risk_level: previousRisk.risk_level,
        change: riskChange,
        direction,
        message: `Rapid ${direction} in flood risk in ${currentRisk.location}: ${absoluteChange} point ${direction} (${previousRisk.risk_score} → ${currentRisk.risk_score})`,
        priority: absoluteChange >= 50 ? 'emergency' : absoluteChange >= 30 ? 'high' : 'medium'
      };

      console.log(`⚡ RAPID CHANGE DETECTED: ${absoluteChange} point ${direction} in ${currentRisk.location}`);
      
      return this.sendAlert(alert);
    }

    return null;
  }

  /**
   * Send bulk alerts for multiple locations
   * @param {Array} riskResults - Array of risk calculation results
   */
  async sendBulkAlerts(riskResults) {
    const alertsSent = [];
    const alertsFailed = [];

    for (const result of riskResults) {
      try {
        if (result.requires_action) {
          const alertResult = await this.processRiskResult(result);
          alertsSent.push({
            location: result.location,
            risk_level: result.risk_level,
            alert_sent: true,
            details: alertResult
          });
        }
      } catch (error) {
        alertsFailed.push({
          location: result.location,
          risk_level: result.risk_level,
          error: error.message
        });
        console.error(`Failed to process alert for ${result.location}:`, error.message);
      }
    }

    return {
      total: riskResults.length,
      alerts_sent: alertsSent.length,
      alerts_failed: alertsFailed.length,
      results: alertsSent,
      failures: alertsFailed
    };
  }

  /**
   * Configure alert thresholds
   * @param {Object} newThresholds
   */
  configureThresholds(newThresholds) {
    if (newThresholds.warning !== undefined) this.thresholds.warning = newThresholds.warning;
    if (newThresholds.high !== undefined) this.thresholds.high = newThresholds.high;
    if (newThresholds.critical !== undefined) this.thresholds.critical = newThresholds.critical;
    if (newThresholds.rapidChange !== undefined) this.thresholds.rapidChange = newThresholds.rapidChange;
    
    console.log('🔧 Alert thresholds updated:', this.thresholds);
  }

  /**
   * Enable/disable alert channels
   * @param {Object} channels
   */
  configureChannels(channels) {
    if (channels.console !== undefined) this.channels.console = channels.console;
    if (channels.email !== undefined) this.channels.email = channels.email;
    if (channels.webhook !== undefined) this.channels.webhook = channels.webhook;
    if (channels.push !== undefined) this.channels.push = channels.push;
    
    console.log('🔧 Alert channels updated:', this.channels);
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      thresholds: { ...this.thresholds },
      channels: { ...this.channels },
      webhookUrl: this.webhookUrl
    };
  }
}

// Singleton instance
const alertService = new AlertService();

module.exports = alertService;
module.exports.AlertService = AlertService;
module.exports.default = alertService;
