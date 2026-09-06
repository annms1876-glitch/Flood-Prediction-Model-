// Firebase Service Layer
// Provides notification and real-time communication services

const firebaseConfig = require('../config/firebase');

class FirebaseService {
  constructor() {
    this.app = null;
    this.db = null;
  }

  /**
   * Initialize the service (call after Firebase is initialized)
   */
  init() {
    if (firebaseConfig.isInitialized() && firebaseConfig.admin) {
      this.app = firebaseConfig.admin.app();
      this.db = firebaseConfig.getFirestore();
    }
    return this;
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.app !== null;
  }

  /**
   * Send push notification to a device
   * @param {string} token - FCM device token
   * @param {Object} notification - Notification payload
   * @param {string} notification.title - Notification title
   * @param {string} notification.body - Notification body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Send result
   */
  async sendPushNotification(token, notification, options = {}) {
    if (!this.app) {
      throw new Error('Firebase Admin not initialized');
    }

    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        type: options.type || 'flood_alert',
        risk_level: options.risk_level || 'warning',
        location: options.location || '',
        timestamp: new Date().toISOString()
      },
      android: options.android || {
        priority: 'high',
        notification: {
          sound: 'alert_stream.wav',
          channel_id: 'flood_alerts'
        }
      },
      apns: options.apns || {
        payload: {
          aps: {
            sound: 'alert.caf',
            category: 'FLOOD_ALERT'
          }
        }
      }
    };

    try {
      const response = await this.app.messaging().send(message);
      return {
        success: true,
        messageId: response,
        token
      };
    } catch (error) {
      // Handle unregistered tokens
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        return {
          success: false,
          error: 'Token not registered',
          code: 'INVALID_TOKEN',
          token
        };
      }
      throw error;
    }
  }

  /**
   * Send multicast notification to multiple devices
   * @param {Array<string>} tokens - FCM device tokens
   * @param {Object} notification - Notification payload
   * @returns {Promise<Object>} Send result with success/failure counts
   */
  async sendMulticastNotification(tokens, notification) {
    if (!this.app) {
      throw new Error('Firebase Admin not initialized');
    }

    if (!tokens || tokens.length === 0) {
      return { success: false, message: 'No tokens provided' };
    }

    const message = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        type: 'flood_alert',
        timestamp: new Date().toISOString()
      }
    };

    try {
      const response = await this.app.messaging().sendEachForMulticast(message);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        results: response.responses
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send flood alert to all subscribed devices in a location
   * @param {Array<string>} tokens - Device tokens for location
   * @param {Object} alertData - Alert details
   * @returns {Promise<Object>} Send result
   */
  async sendFloodAlert(tokens, alertData) {
    const notification = {
      title: `Flood Alert: ${alertData.risk_level.toUpperCase()}`,
      body: alertData.message || 'Flood warning issued for your area'
    };

    return this.sendMulticastNotification(tokens, notification);
  }

  /**
   * Log alert to Firestore for audit trail
   * @param {Object} alert - Alert data to store
   * @returns {Promise<Object>} Log result
   */
  async logAlert(alert) {
    if (!this.db) {
      console.warn('Firestore not available, skipping alert log');
      return null;
    }

    const alertRef = this.db.collection('alert_logs').doc();
    await alertRef.set({
      ...alert,
      created_at: new Date().toISOString(),
      id: alertRef.id
    });

    return { success: true, id: alertRef.id };
  }

  /**
   * Store sensor data to Firestore for real-time dashboard updates
   * @param {string} collectionName - Collection name
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  async storeRealtimeData(collectionName, data) {
    if (!this.db) {
      console.warn('Firestore not available, skipping data storage');
      return;
    }

    const docRef = this.db.collection(collectionName).doc();
    await docRef.set({
      ...data,
      timestamp: new Date().toISOString(),
      id: docRef.id
    });
  }
}

// Singleton instance
const firebaseService = new FirebaseService().init();

module.exports = firebaseService;
