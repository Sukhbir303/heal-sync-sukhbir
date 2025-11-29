// Enhanced Scenario System with ML Integration
const express = require('express');
const { publish } = require('../eventBus');
const EVENTS = require('../constants/events');
const Entity = require('../models/Entity');
const AgentActivity = require('../models/AgentActivity');
const diseaseSimulator = require('../services/diseaseSimulator');

const scenarios = {
  dengue: {
    name: 'Dengue Outbreak',
    description: 'Sudden spike in dengue fever cases',
    diseaseMultiplier: 5,
    affectedZones: ['Zone-1', 'Zone-2'],
    duration: 72, // hours
    symptoms: ['fever', 'headache', 'joint pain'],
    severity: 'high'
  },
  covid19: {
    name: 'COVID-19 Wave',
    description: 'New COVID-19 variant spreading',
    diseaseMultiplier: 8,
    affectedZones: ['Zone-1', 'Zone-2', 'Zone-3'],
    duration: 168, // hours (1 week)
    symptoms: ['fever', 'cough', 'breathing difficulty'],
    severity: 'critical'
  },
  typhoid: {
    name: 'Typhoid Outbreak',
    description: 'Water contamination leading to typhoid',
    diseaseMultiplier: 4,
    affectedZones: ['Zone-3'],
    duration: 96, // hours
    symptoms: ['fever', 'stomach pain', 'weakness'],
    severity: 'high'
  },
  malaria: {
    name: 'Malaria Outbreak',
    description: 'Increased mosquito activity',
    diseaseMultiplier: 6,
    affectedZones: ['Zone-2', 'Zone-3'],
    duration: 120, // hours
    symptoms: ['fever', 'chills', 'sweating'],
    severity: 'high'
  },
  influenza: {
    name: 'Seasonal Flu',
    description: 'Influenza season outbreak',
    diseaseMultiplier: 3,
    affectedZones: ['Zone-1', 'Zone-2', 'Zone-3'],
    duration: 144, // hours
    symptoms: ['fever', 'body ache', 'fatigue'],
    severity: 'medium'
  }
};

module.exports = (log) => {
  const router = express.Router();

  // Get all available scenarios
  router.get('/scenarios', (req, res) => {
    const scenarioList = Object.keys(scenarios).map(key => ({
      id: key,
      ...scenarios[key],
      active: false // TODO: Check if currently active
    }));
    res.json(scenarioList);
  });

  // Get disease statistics
  router.get('/scenarios/statistics', async (req, res) => {
    try {
      const stats = await diseaseSimulator.getStatistics();
      res.json({
        success: true,
        statistics: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting disease statistics:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch statistics' 
      });
    }
  });

  // Trigger a scenario
  router.post('/scenarios/:diseaseId/trigger', async (req, res) => {
    const { diseaseId } = req.params;
    const scenario = scenarios[diseaseId];

    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    try {
      log(`🎬 SCENARIO TRIGGERED: ${scenario.name}`, {
        type: 'SCENARIO',
        disease: diseaseId,
        zones: scenario.affectedZones
      });

      // Use disease simulator to trigger outbreak
      const outbreakId = await diseaseSimulator.triggerOutbreak(diseaseId, scenario.affectedZones);
      
      log(`🦠 Disease simulator activated - Outbreak ID: ${outbreakId}`, {
        type: 'SCENARIO_UPDATE',
        disease: diseaseId,
        zones: scenario.affectedZones
      });

      // Get affected entities for reporting
      const labs = await Entity.find({
        entityType: 'lab',
        zone: { $in: scenario.affectedZones }
      });

      // Broadcast outbreak event to all agents
      publish(EVENTS.DISEASE_OUTBREAK_PREDICTED, {
        disease: diseaseId,
        zones: scenario.affectedZones,
        riskLevel: scenario.severity === 'critical' ? 'critical' : 'high',
        predictedCases: 500 * scenario.diseaseMultiplier,
        growthRate: scenario.diseaseMultiplier,
        positiveRate: 25,
        scenario: scenario.name,
        outbreakId,
        timestamp: new Date()
      });

      // Log activity to database
      await AgentActivity.create({
        agentType: 'system',
        entityId: null,
        activityType: 'SCENARIO_TRIGGERED',
        description: `${scenario.name} scenario activated`,
        metadata: {
          disease: diseaseId,
          zones: scenario.affectedZones,
          multiplier: scenario.diseaseMultiplier
        }
      });

      res.json({
        success: true,
        scenario: {
          id: diseaseId,
          ...scenario
        },
        affectedLabs: labs.length,
        message: `${scenario.name} triggered successfully. Watch agents respond!`
      });

    } catch (error) {
      console.error('Scenario trigger error:', error);
      res.status(500).json({ error: 'Failed to trigger scenario' });
    }
  });

  // Get ML prediction for a disease
  router.post('/scenarios/analyze', async (req, res) => {
    const { disease, zoneId } = req.body;

    try {
      // Get labs in the zone
      const labs = await Entity.find({
        entityType: 'lab',
        zone: zoneId || { $exists: true }
      });

      // Aggregate test data
      const aggregatedData = {
        current_tests: {},
        baseline_tests: {},
        positive_tests: {}
      };

      labs.forEach(lab => {
        const testData = lab.currentState.testData;
        Object.keys(testData).forEach(d => {
          if (!aggregatedData.current_tests[d]) {
            aggregatedData.current_tests[d] = 0;
            aggregatedData.baseline_tests[d] = 8; // baseline
            aggregatedData.positive_tests[d] = 0;
          }
          aggregatedData.current_tests[d] += testData[d].today || 0;
          aggregatedData.positive_tests[d] += testData[d].positive || 0;
        });
      });

      // Call ML service for prediction
      try {
        const mlResponse = await fetch('http://localhost:8000/predict/outbreak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(aggregatedData)
        });

        if (mlResponse.ok) {
          const predictions = await mlResponse.json();
          return res.json({
            success: true,
            ml_powered: true,
            predictions,
            labs_analyzed: labs.length
          });
        }
      } catch (mlError) {
        console.log('ML service not available, using rule-based analysis');
      }

      // Fallback: Rule-based analysis
      const analysis = Object.keys(aggregatedData.current_tests).map(d => {
        const current = aggregatedData.current_tests[d];
        const baseline = aggregatedData.baseline_tests[d];
        const positive = aggregatedData.positive_tests[d];
        const growthRate = ((current - baseline) / baseline) * 100;
        const positiveRate = current > 0 ? (positive / current) * 100 : 0;

        let riskLevel = 'LOW';
        if (growthRate > 200 && positiveRate > 20) riskLevel = 'CRITICAL';
        else if (growthRate > 100 && positiveRate > 15) riskLevel = 'HIGH';
        else if (growthRate > 50) riskLevel = 'MEDIUM';

        return {
          disease: d,
          risk_level: riskLevel,
          growth_rate: growthRate.toFixed(1),
          predicted_cases_24h: Math.floor(current * (1 + growthRate / 100)),
          positive_rate: positiveRate.toFixed(1),
          trigger_outbreak: riskLevel === 'CRITICAL' || riskLevel === 'HIGH',
          recommendation: riskLevel === 'CRITICAL' ? '⚠️ OUTBREAK DETECTED!' : 
                         riskLevel === 'HIGH' ? '⚠️ High risk - Monitor closely' : 
                         '✅ Normal levels'
        };
      });

      res.json({
        success: true,
        ml_powered: false,
        predictions: analysis,
        labs_analyzed: labs.length
      });

    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: 'Analysis failed' });
    }
  });

  // Stop/reset a scenario
  router.post('/scenarios/:diseaseId/reset', async (req, res) => {
    const { diseaseId } = req.params;

    try {
      // Reset test data for all labs
      const labs = await Entity.find({ entityType: 'lab' });

      for (const lab of labs) {
        const testData = lab.currentState.testData;
        if (testData[diseaseId]) {
          testData[diseaseId].today = Math.floor(Math.random() * 20) + 5;
          testData[diseaseId].positive = Math.floor(Math.random() * 3);
          lab.markModified('currentState');
          await lab.save();
        }
      }

      res.json({
        success: true,
        message: `${diseaseId} scenario reset`
      });

    } catch (error) {
      res.status(500).json({ error: 'Reset failed' });
    }
  });

  return router;
};

