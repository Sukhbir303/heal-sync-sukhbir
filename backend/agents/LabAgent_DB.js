// backend/agents/LabAgent_DB.js - MongoDB Version
const { publish } = require("../eventBus");
const EVENTS = require('../constants/events');
const dbManager = require('../utils/dbManager');
const Entity = require('../models/Entity');

class LabAgent {
  constructor(entityId, log) {
    this.entityId = entityId;
    this.log = log;
    this.entity = null;
  }

  async start() {
    // Load lab data from database
    this.entity = await Entity.findById(this.entityId);
    
    if (!this.entity) {
      console.error(`Lab ${this.entityId} not found in database`);
      return;
    }

    // Initialize testData if not exists
    if (!this.entity.currentState.testData) {
      this.entity.currentState.testData = {
        dengue: { today: 12, positive: 2, capacity: 200, history: [10, 11, 12], positiveRate: 0, tickCount: 0 },
        malaria: { today: 8, positive: 1, capacity: 150, history: [7, 8, 8], positiveRate: 0, tickCount: 0 },
        typhoid: { today: 5, positive: 0, capacity: 100, history: [4, 5, 5], positiveRate: 0, tickCount: 0 },
        influenza: { today: 15, positive: 3, capacity: 180, history: [12, 14, 15], positiveRate: 0, tickCount: 0 },
        covid: { today: 20, positive: 1, capacity: 500, history: [18, 19, 20], positiveRate: 0, tickCount: 0 }
      };
      await this.entity.save();
    }

    this.log(
      `✅ Lab Agent ${this.entity.name} initialized - Testing 5 diseases in ${this.entity.zone}`,
      { agent: 'Lab', type: 'INIT', entityId: this.entityId.toString() }
    );

    // Runs every 10 seconds
    setInterval(() => this.tick(), 10000);
  }

  async tick() {
    // Reload fresh data from database
    this.entity = await Entity.findById(this.entityId);
    if (!this.entity || !this.entity.currentState.testData) return;

    const state = this.entity.currentState;
    const diseases = ['dengue', 'malaria', 'typhoid', 'influenza', 'covid'];
    
    // DYNAMIC SIMULATION: Simulate natural test growth
    this.simulateNaturalTestGrowth(state.testData, diseases);

    // Calculate total tests and positive rates
    const totalTests = Object.values(state.testData).reduce((sum, data) => sum + (data.today || 0), 0);
    const totalPositive = Object.values(state.testData).reduce((sum, data) => sum + (data.positive || 0), 0);
    const positiveRate = totalTests > 0 ? ((totalPositive / totalTests) * 100).toFixed(1) : 0;

    // Find diseases with concerning positive rates
    const concerning = diseases.filter(d => {
      const data = state.testData[d];
      return data && data.today > 0 && (data.positive / data.today) > 0.1;
    });

    // ALWAYS log current status
    const concerningText = concerning.length > 0 ? ` | 🔍 Monitoring: ${concerning.join(', ')}` : '';
    this.log(
      `${this.entity.name}: Processing ${totalTests} tests today | Positive rate: ${positiveRate}%${concerningText}`,
      { agent: 'Lab', type: 'STATUS', entityId: this.entityId.toString(), totalTests, positiveRate }
    );
    
    // Check all diseases for outbreaks
    for (const disease of diseases) {
      await this.checkDiseaseOutbreak(state.testData, disease);
    }
    
    // Check lab capacity
    this.checkLabCapacity(state.testData);

    // Save updated state to database
    this.entity.markModified('currentState');
    await this.entity.save();
    
    // Log metrics
    await dbManager.logMetrics(
      this.entityId,
      'lab',
      this.entity.zone,
      {
        testData: state.testData,
        totalTests,
        positiveRate: parseFloat(positiveRate)
      }
    );
  }

  simulateNaturalTestGrowth(testData, diseases) {
    diseases.forEach(disease => {
      const data = testData[disease];
      if (!data) return;
      
      const seasonalFactor = this.getSeasonalFactor(disease);
      const baseChange = Math.floor((Math.random() * 11 - 3) * seasonalFactor);
      
      const previousValue = data.today;
      data.today = Math.max(0, data.today + baseChange);
      
      if (!data.tickCount) data.tickCount = 0;
      data.tickCount++;
      
      if (data.tickCount >= 6) {
        data.tickCount = 0;
        if (!data.history) data.history = [];
        data.history.push(previousValue);
        if (data.history.length > 7) {
          data.history.shift();
        }
      }
      
      const basePositiveRate = 0.08 + (Math.random() * 0.17);
      data.positive = Math.floor(data.today * basePositiveRate);
      data.positiveRate = data.today > 0 ? 
        ((data.positive / data.today) * 100).toFixed(1) : 0;
      
      if (Math.random() < 0.05) {
        const spike = Math.floor(Math.random() * 8 + 3);
        data.today += spike;
        data.positive = Math.floor(data.today * (basePositiveRate * 1.3));
      }
    });
  }

  getSeasonalFactor(disease) {
    const month = new Date().getMonth();
    const hour = new Date().getHours();
    
    let seasonalMultiplier = 1.0;
    
    switch(disease) {
      case 'dengue':
        if ([5, 6, 7, 8].includes(month)) seasonalMultiplier = 1.6;
        else if ([4, 9].includes(month)) seasonalMultiplier = 1.3;
        break;
      case 'malaria':
        if ([6, 7, 8, 9].includes(month)) seasonalMultiplier = 1.5;
        break;
      case 'influenza':
        if ([10, 11, 0, 1].includes(month)) seasonalMultiplier = 1.7;
        break;
      case 'covid':
        if ([11, 0, 1].includes(month)) seasonalMultiplier = 1.3;
        break;
      case 'typhoid':
        if ([3, 4, 5].includes(month)) seasonalMultiplier = 1.4;
        break;
    }
    
    if (hour >= 8 && hour <= 12) seasonalMultiplier *= 1.2;
    else if (hour >= 13 && hour <= 16) seasonalMultiplier *= 1.1;
    
    return seasonalMultiplier;
  }

  async checkDiseaseOutbreak(testData, disease) {
    const data = testData[disease];
    if (!data || !data.history || data.history.length < 2) return;

    const history = data.history;
    const today = data.today;

    const last = history[history.length - 1];
    const secondLast = history[history.length - 2];
    const avg = (last + secondLast) / 2;

    const growthRate = avg > 0 ? (today - avg) / avg : 0;
    
    let riskLevel = 'low';
    let confidence = history.length >= 5 ? 0.85 : 0.65;
    
    if (growthRate > 1.5) riskLevel = 'critical';
    else if (growthRate > 0.8) riskLevel = 'high';
    else if (growthRate > 0.4) riskLevel = 'medium';

    if (avg > 0 && today > 1.5 * avg) {
      // Get hospitals and pharmacies in this zone from database
      const [zoneHospitals, zonePharmacies] = await Promise.all([
        dbManager.getEntitiesByZone(this.entity.zone, 'hospital'),
        dbManager.getEntitiesByZone(this.entity.zone, 'pharmacy')
      ]);

      const hospitalNames = zoneHospitals.map(h => h.name);
      const pharmacyNames = zonePharmacies.map(p => p.name);

      this.log(
        `🚨 ${this.entity.name}: ${disease.toUpperCase()} OUTBREAK DETECTED! Tests: ${today} (+${(growthRate * 100).toFixed(0)}% spike) | Positive rate: ${((data.positive/today) * 100).toFixed(1)}%`,
        { 
          agent: "Lab", 
          type: `OUTBREAK_DETECTED`, 
          entityId: this.entityId.toString(),
          zone: this.entity.zone,
          disease,
          riskLevel,
          confidence
        }
      );

      this.log(
        `📡 ${this.entity.name}: Broadcasting ${disease.toUpperCase()} alert to ${hospitalNames.length} hospitals & ${pharmacyNames.length} pharmacies in ${this.entity.zone}`,
        { 
          agent: "Lab", 
          type: `COORDINATION`, 
          entityId: this.entityId.toString(),
          zone: this.entity.zone,
          disease,
          recipients: {
            hospitals: hospitalNames,
            pharmacies: pharmacyNames
          }
        }
      );

      publish(`${disease.toUpperCase()}_OUTBREAK_PREDICTED`, {
        labId: this.entityId.toString(),
        labName: this.entity.name,
        zone: this.entity.zone,
        disease,
        today,
        avg: avg.toFixed(1),
        growthRate: (growthRate * 100).toFixed(1),
        riskLevel,
        confidence,
        positiveRate: data.positiveRate,
        predictedCases: Math.round(today * (1 + growthRate))
      });
    }
  }

  checkLabCapacity(testData) {
    const totalTests = Object.values(testData).reduce((sum, data) => sum + (data.today || 0), 0);
    const totalCapacity = Object.values(testData).reduce((sum, data) => sum + (data.capacity || 0), 0);
    const utilization = totalTests / totalCapacity;

    if (utilization > 0.85) {
      this.log(
        `[Lab ${this.entity.name}] High capacity utilization: ${(utilization * 100).toFixed(1)}% (${totalTests}/${totalCapacity} tests)`,
        { agent: "Lab", type: "CAPACITY_WARNING", entityId: this.entityId.toString(), utilization }
      );

      publish("LAB_CAPACITY_WARNING", {
        labId: this.entityId.toString(),
        zone: this.entity.zone,
        utilization,
        totalTests,
        totalCapacity
      });
    }
  }
}

module.exports = LabAgent;

