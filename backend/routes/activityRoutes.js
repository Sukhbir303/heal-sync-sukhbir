// Entity Activity & Alert System
const express = require('express');
const AgentActivity = require('../models/AgentActivity');
const Entity = require('../models/Entity');
const MetricsLog = require('../models/MetricsLog');

module.exports = () => {
  const router = express.Router();

  // Get recent activities (for city dashboard)
  router.get('/activities/recent', async (req, res) => {
    try {
      const { limit = 50 } = req.query;

      const activities = await AgentActivity.find()
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: activities
      });

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch recent activities' 
      });
    }
  });

  // Get activities for a specific entity
  router.get('/entity/:entityId/activities', async (req, res) => {
    try {
      const { entityId } = req.params;
      const { limit = 50, type } = req.query;

      const query = { entityId };
      if (type) query.activityType = type;

      const activities = await AgentActivity.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        entityId,
        activities: activities.map(a => ({
          id: a._id,
          type: a.activityType,
          description: a.description,
          timestamp: a.timestamp,
          metadata: a.metadata,
          priority: a.metadata?.priority || 'normal',
          status: a.metadata?.status || 'completed'
        })),
        total: activities.length
      });

    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  });

  // Get alerts for a specific entity
  router.get('/entity/:entityId/alerts', async (req, res) => {
    try {
      const { entityId } = req.params;
      const { active = true } = req.query;

      // Get recent critical activities as alerts
      const alertTypes = [
        'OUTBREAK_ALERT',
        'MEDICINE_REQUEST',
        'CAPACITY_WARNING',
        'STOCK_CRITICAL',
        'ORDER_URGENT',
        'RESOURCE_SHORTAGE'
      ];

      const query = {
        entityId,
        activityType: { $in: alertTypes }
      };

      // Only get recent unresolved alerts if active=true
      if (active === 'true' || active === true) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        query.timestamp = { $gte: oneHourAgo };
      }

      const alerts = await AgentActivity.find(query)
        .sort({ timestamp: -1 })
        .limit(20);

      res.json({
        success: true,
        alerts: alerts.map(a => ({
          id: a._id,
          type: a.activityType,
          message: a.description,
          timestamp: a.timestamp,
          severity: a.metadata?.severity || a.metadata?.riskLevel || 'medium',
          disease: a.metadata?.disease,
          zone: a.metadata?.zone,
          status: a.metadata?.status || 'active',
          actionRequired: a.metadata?.actionRequired || false
        })),
        total: alerts.length
      });

    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  // Get real-time metrics for entity
  router.get('/entity/:entityId/metrics', async (req, res) => {
    try {
      const { entityId } = req.params;
      const { hours = 24 } = req.query;

      const entity = await Entity.findById(entityId);
      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }

      // Get metrics from last N hours
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const metrics = await MetricsLog.find({
        entityId,
        timestamp: { $gte: since }
      }).sort({ timestamp: 1 });

      // Build time-series data
      const timeSeries = {
        labels: [],
        datasets: {}
      };

      metrics.forEach(m => {
        const timeLabel = new Date(m.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
        timeSeries.labels.push(timeLabel);

        Object.keys(m.metrics).forEach(key => {
          if (!timeSeries.datasets[key]) {
            timeSeries.datasets[key] = [];
          }
          timeSeries.datasets[key].push(m.metrics[key]);
        });
      });

      // Get current state snapshot
      const currentState = {
        entityType: entity.entityType,
        name: entity.name,
        zone: entity.zone
      };

      if (entity.entityType === 'hospital') {
        const beds = entity.currentState.beds;
        const totalBeds = Object.values(beds).reduce((sum, b) => sum + (b.total || 0), 0);
        const usedBeds = Object.values(beds).reduce((sum, b) => sum + (b.used || 0), 0);
        
        currentState.bedOccupancy = totalBeds > 0 ? ((usedBeds / totalBeds) * 100).toFixed(1) : 0;
        currentState.totalBeds = totalBeds;
        currentState.usedBeds = usedBeds;
        currentState.availableBeds = totalBeds - usedBeds;
        currentState.icuBeds = beds.icu;
        currentState.erWaitTime = entity.currentState.patientMetrics?.erWaitingTime || 0;
      }

      if (entity.entityType === 'lab') {
        const testData = entity.currentState.testData;
        currentState.testsToday = Object.values(testData).reduce((sum, t) => sum + (t.today || 0), 0);
        currentState.positiveTests = Object.values(testData).reduce((sum, t) => sum + (t.positive || 0), 0);
        currentState.positiveRate = currentState.testsToday > 0 ? 
          ((currentState.positiveTests / currentState.testsToday) * 100).toFixed(1) : 0;
        currentState.byDisease = testData;
      }

      if (entity.entityType === 'pharmacy') {
        const medicines = entity.currentState.medicines || {};
        const lowStock = Object.entries(medicines).filter(([name, data]) => 
          data.stock < data.reorderLevel
        );
        currentState.totalMedicines = Object.keys(medicines).length;
        currentState.lowStockCount = lowStock.length;
        currentState.lowStockItems = lowStock.map(([name]) => name);
      }

      if (entity.entityType === 'supplier') {
        const inventory = entity.currentState.inventory || {};
        currentState.totalItems = Object.keys(inventory).length;
        currentState.activeOrders = (entity.currentState.activeOrders || []).length;
      }

      res.json({
        success: true,
        entity: currentState,
        timeSeries,
        metricsCount: metrics.length
      });

    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // Get activities by entity ID (alternate endpoint)
  router.get('/activities/entity/:entityId', async (req, res) => {
    try {
      const { entityId } = req.params;
      const { limit = 50 } = req.query;

      const activities = await AgentActivity.find({ entityId })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: activities
      });

    } catch (error) {
      console.error('Error fetching entity activities:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch entity activities' 
      });
    }
  });

  // Get activities by scenario ID
  router.get('/activities/scenario/:scenarioId', async (req, res) => {
    try {
      const { scenarioId } = req.params;

      const activities = await AgentActivity.find({ 
        'metadata.scenarioId': scenarioId 
      }).sort({ timestamp: 1 });

      res.json({
        success: true,
        data: activities
      });

    } catch (error) {
      console.error('Error fetching scenario activities:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch scenario activities' 
      });
    }
  });

  // Get current active scenarios
  router.get('/scenarios/active', async (req, res) => {
    try {
      // Get recent scenario activities
      const recentScenarios = await AgentActivity.find({
        activityType: 'SCENARIO_TRIGGERED',
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).sort({ timestamp: -1 });

      const activeScenarios = recentScenarios.map(s => ({
        disease: s.metadata?.disease,
        triggeredAt: s.timestamp,
        zones: s.metadata?.zones,
        status: 'active'
      }));

      res.json({
        success: true,
        activeScenarios,
        total: activeScenarios.length
      });

    } catch (error) {
      console.error('Error fetching active scenarios:', error);
      res.status(500).json({ error: 'Failed to fetch scenarios' });
    }
  });

  return router;
};

