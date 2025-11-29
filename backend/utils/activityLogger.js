// Centralized Activity Logger for All Agents
const AgentActivity = require('../models/AgentActivity');
const Entity = require('../models/Entity');

class ActivityLogger {
  /**
   * Log an activity for an entity
   * @param {String} entityId - MongoDB entity ID
   * @param {String} agentType - 'hospital', 'lab', 'pharmacy', 'supplier', 'city'
   * @param {String} activityType - Type of activity (see types below)
   * @param {String} description - Human-readable description
   * @param {Object} metadata - Additional data
   */
  static async log(entityId, agentType, activityType, description, metadata = {}) {
    try {
      // Fetch entity name if entityId is provided
      let entityName = metadata.entityName;
      if (entityId && !entityName && entityId !== 'CITY_ADMIN') {
        try {
          const entity = await Entity.findById(entityId).select('name').lean();
          entityName = entity ? entity.name : 'Unknown Entity';
        } catch (err) {
          entityName = 'Unknown Entity';
        }
      } else if (entityId === 'CITY_ADMIN') {
        entityName = 'City Health Department';
      }

      // Capitalize agentType for consistency
      const normalizedAgentType = agentType.charAt(0).toUpperCase() + agentType.slice(1).toLowerCase();

      await AgentActivity.create({
        entityId,
        entityName,
        agentType: normalizedAgentType,
        activityType,
        description,
        message: description, // Also store as message for frontend
        action: metadata.action || activityType,
        severity: metadata.severity || 'info',
        metadata: {
          ...metadata,
          timestamp: new Date()
        }
      });
    } catch (error) {
      // Silently fail - logging should never break the main flow
      // console.error('Activity logging error:', error.message);
    }
  }

  /**
   * Log an alert (high-priority activity)
   */
  static async logAlert(entityId, agentType, alertType, message, severity = 'medium', metadata = {}) {
    return this.log(entityId, agentType, alertType, message, {
      ...metadata,
      severity,
      alert: true,
      actionRequired: true
    });
  }

  /**
   * Log coordination between entities
   */
  static async logCoordination(fromEntityId, toEntityId, action, description, metadata = {}) {
    return this.log(fromEntityId, metadata.agentType || 'unknown', 'COORDINATION', description, {
      ...metadata,
      targetEntityId: toEntityId,
      action
    });
  }

  /**
   * Log monitoring activity
   */
  static async logMonitoring(entityId, agentType, targetType, description, metadata = {}) {
    return this.log(entityId, agentType, 'MONITORING', description, {
      ...metadata,
      targetType,
      action: 'monitor'
    });
  }

  /**
   * Log communication between agents
   */
  static async logCommunication(fromEntityId, fromAgentType, toAgentType, message, metadata = {}) {
    return this.log(fromEntityId, fromAgentType, 'COMMUNICATION', message, {
      ...metadata,
      targetAgentType: toAgentType,
      action: 'communicate'
    });
  }

  /**
   * Get recent activities for an entity
   */
  static async getActivities(entityId, limit = 50, type = null) {
    const query = { entityId };
    if (type) query.activityType = type;

    return await AgentActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  /**
   * Get active alerts for an entity
   */
  static async getActiveAlerts(entityId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return await AgentActivity.find({
      entityId,
      timestamp: { $gte: oneHourAgo },
      'metadata.alert': true,
      'metadata.status': { $ne: 'resolved' }
    }).sort({ timestamp: -1 });
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(activityId) {
    const activity = await AgentActivity.findById(activityId);
    if (activity) {
      activity.metadata.status = 'resolved';
      activity.metadata.resolvedAt = new Date();
      activity.markModified('metadata');
      await activity.save();
    }
  }
}

// Activity Types Reference
ActivityLogger.TYPES = {
  // Hospital
  PATIENT_ADMITTED: 'PATIENT_ADMITTED',
  PATIENT_DISCHARGED: 'PATIENT_DISCHARGED',
  BED_CAPACITY_WARNING: 'BED_CAPACITY_WARNING',
  ICU_FULL: 'ICU_FULL',
  WARD_PREPARED: 'WARD_PREPARED',
  MEDICINE_REQUEST: 'MEDICINE_REQUEST',
  
  // Lab
  OUTBREAK_DETECTED: 'OUTBREAK_DETECTED',
  TEST_SPIKE: 'TEST_SPIKE',
  DISEASE_MONITORING: 'DISEASE_MONITORING',
  
  // Pharmacy
  STOCK_LOW: 'STOCK_LOW',
  STOCK_CRITICAL: 'STOCK_CRITICAL',
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_RECEIVED: 'ORDER_RECEIVED',
  
  // Supplier
  ORDER_FULFILLED: 'ORDER_FULFILLED',
  DELIVERY_SCHEDULED: 'DELIVERY_SCHEDULED',
  INVENTORY_LOW: 'INVENTORY_LOW',
  
  // City
  CITY_ALERT: 'CITY_ALERT',
  RESOURCE_COORDINATION: 'RESOURCE_COORDINATION',
  SCENARIO_TRIGGERED: 'SCENARIO_TRIGGERED',
  
  // General
  COORDINATION: 'COORDINATION',
  STATUS_UPDATE: 'STATUS_UPDATE'
};

module.exports = ActivityLogger;

