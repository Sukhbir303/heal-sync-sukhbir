// Disease Simulator Service - Continuously updates disease data
const Entity = require('../models/Entity');
const DiseaseDataGenerator = require('../utils/diseaseDataGenerator');
const ActivityLogger = require('../utils/activityLogger');

class DiseaseSimulator {
  constructor() {
    this.isRunning = false;
    this.updateInterval = null;
    this.currentOutbreaks = new Map(); // Track active outbreaks
  }

  /**
   * Start the disease simulation
   */
  async start() {
    if (this.isRunning) return;
    
    console.log('🦠 Starting Disease Simulator...');
    this.isRunning = true;

    // Initial data population
    try {
      await this.updateAllEntities();
    } catch (error) {
      console.error('⚠️  Initial disease data update failed:', error.message);
    }

    // Update every 30 seconds
    this.updateInterval = setInterval(async () => {
      try {
        await this.updateAllEntities();
      } catch (error) {
        console.error('⚠️  Disease data update failed:', error.message);
      }
    }, 30000);

    console.log('✅ Disease Simulator started - Updating every 30 seconds');
  }

  /**
   * Stop the simulator
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Disease Simulator stopped');
  }

  /**
   * Trigger an outbreak for a specific disease
   * @param {String} disease - Disease name
   * @param {Array} zones - Affected zones
   */
  async triggerOutbreak(disease, zones = ['Zone-1', 'Zone-2']) {
    console.log(`🚨 Triggering ${disease} outbreak in zones: ${zones.join(', ')}`);
    
    const outbreakId = `${disease}-${Date.now()}`;
    this.currentOutbreaks.set(outbreakId, {
      disease,
      zones,
      startTime: Date.now(),
      multiplier: 3
    });

    // Immediate update
    await this.updateAllEntities();

    // Remove outbreak after 5 minutes
    setTimeout(() => {
      this.currentOutbreaks.delete(outbreakId);
      console.log(`✅ ${disease} outbreak simulation ended`);
    }, 5 * 60 * 1000);

    return outbreakId;
  }

  /**
   * Get active outbreak disease for a zone
   * @param {String} zone - Zone identifier
   * @returns {Object|null} Outbreak info
   */
  getActiveOutbreak(zone) {
    for (const [id, outbreak] of this.currentOutbreaks.entries()) {
      if (outbreak.zones.includes(zone)) {
        return outbreak;
      }
    }
    return null;
  }

  /**
   * Update all entities with new disease data
   */
  async updateAllEntities() {
    try {
      // Update labs
      await this.updateLabs();
      
      // Update hospitals
      await this.updateHospitals();
      
      // Update pharmacies
      await this.updatePharmacies();
      
    } catch (error) {
      console.error('Error updating disease data:', error.message);
    }
  }

  /**
   * Update lab test data
   */
  async updateLabs() {
    const labs = await Entity.find({ entityType: 'lab' });
    
    for (const lab of labs) {
      const outbreak = this.getActiveOutbreak(lab.zone);
      
      const testData = DiseaseDataGenerator.generateLabTestData({
        capacity: lab.currentState?.capacity || 1000,
        baseLoad: 0.4 + Math.random() * 0.2,
        outbreakDisease: outbreak?.disease,
        outbreakMultiplier: outbreak?.multiplier || 1
      });

      // Update lab's test results
      if (!lab.currentState) lab.currentState = {};
      if (!lab.currentState.testResults) lab.currentState.testResults = {};
      
      // Convert to the format expected by frontend
      Object.entries(testData).forEach(([disease, data]) => {
        lab.currentState.testResults[disease] = data.positive;
      });

      lab.currentState.testData = testData;
      lab.currentState.lastUpdated = new Date();
      
      lab.markModified('currentState');
      await lab.save();
    }
  }

  /**
   * Update hospital case data
   */
  async updateHospitals() {
    const hospitals = await Entity.find({ entityType: 'hospital' });
    
    for (const hospital of hospitals) {
      const outbreak = this.getActiveOutbreak(hospital.zone);
      
      // Calculate total beds
      const beds = hospital.currentState?.beds || {};
      const totalBeds = Object.values(beds).reduce((sum, bed) => sum + (bed.total || 0), 0);
      const usedBeds = Object.values(beds).reduce((sum, bed) => sum + (bed.used || 0), 0);
      const currentOccupancy = totalBeds > 0 ? usedBeds / totalBeds : 0.3;
      
      const caseData = DiseaseDataGenerator.generateHospitalCaseData({
        totalBeds,
        currentOccupancy: Math.min(0.85, currentOccupancy + (Math.random() * 0.1 - 0.05)),
        outbreakDisease: outbreak?.disease,
        outbreakMultiplier: outbreak?.multiplier || 1
      });

      // Update hospital disease cases
      if (!hospital.currentState) hospital.currentState = {};
      hospital.currentState.diseaseCases = caseData;
      hospital.currentState.lastUpdated = new Date();
      
      // Update bed usage based on disease cases
      const totalCases = Object.values(caseData).reduce((sum, disease) => sum + disease.total, 0);
      if (beds.general) {
        beds.general.used = Math.min(beds.general.total, Math.floor(totalCases * 0.7));
      }
      if (beds.icu) {
        const criticalCases = Object.values(caseData).reduce((sum, disease) => sum + disease.critical, 0);
        beds.icu.used = Math.min(beds.icu.total, criticalCases);
      }
      
      hospital.markModified('currentState');
      await hospital.save();
    }
  }

  /**
   * Update pharmacy stock based on demand
   */
  async updatePharmacies() {
    const pharmacies = await Entity.find({ entityType: 'pharmacy' });
    
    // Get nearby hospitals to calculate demand
    for (const pharmacy of pharmacies) {
      const nearbyHospitals = await Entity.find({
        entityType: 'hospital',
        zone: pharmacy.zone
      });

      // Aggregate disease data from nearby hospitals
      const aggregatedDiseases = {};
      nearbyHospitals.forEach(hospital => {
        const cases = hospital.currentState?.diseaseCases || {};
        Object.entries(cases).forEach(([disease, data]) => {
          if (!aggregatedDiseases[disease]) {
            aggregatedDiseases[disease] = { total: 0, newToday: 0 };
          }
          aggregatedDiseases[disease].total += data.total || 0;
          aggregatedDiseases[disease].newToday += data.newToday || 0;
        });
      });

      const outbreak = this.getActiveOutbreak(pharmacy.zone);
      const medicineDemand = DiseaseDataGenerator.generateMedicineDemand(aggregatedDiseases);
      
      const stock = DiseaseDataGenerator.generatePharmacyStock(medicineDemand, {
        lowStock: Math.random() > 0.7, // 30% chance of low stock
        outbreakMedicine: outbreak ? this.getDiseaseMedicine(outbreak.disease) : null
      });

      // Update pharmacy stock
      if (!pharmacy.currentState) pharmacy.currentState = {};
      pharmacy.currentState.medicines = stock;
      pharmacy.currentState.medicineDemand = medicineDemand;
      pharmacy.currentState.lastUpdated = new Date();
      
      pharmacy.markModified('currentState');
      await pharmacy.save();
    }
  }

  /**
   * Get primary medicine for a disease
   * @param {String} disease
   * @returns {String}
   */
  getDiseaseMedicine(disease) {
    const mapping = {
      dengue: 'dengueMed',
      malaria: 'chloroquine',
      typhoid: 'ceftriaxone',
      covid: 'covidMed',
      influenza: 'oseltamivir'
    };
    return mapping[disease] || 'paracetamol';
  }

  /**
   * Get current disease statistics across all zones
   * @returns {Object} Statistics
   */
  async getStatistics() {
    const hospitals = await Entity.find({ entityType: 'hospital' });
    const labs = await Entity.find({ entityType: 'lab' });
    
    const stats = {
      totalCases: 0,
      totalTests: 0,
      diseaseBreakdown: {},
      zoneBreakdown: {},
      outbreaks: Array.from(this.currentOutbreaks.values())
    };

    // Aggregate hospital data
    hospitals.forEach(hospital => {
      const cases = hospital.currentState?.diseaseCases || {};
      Object.entries(cases).forEach(([disease, data]) => {
        if (!stats.diseaseBreakdown[disease]) {
          stats.diseaseBreakdown[disease] = 0;
        }
        stats.diseaseBreakdown[disease] += data.total || 0;
        stats.totalCases += data.total || 0;
      });

      if (!stats.zoneBreakdown[hospital.zone]) {
        stats.zoneBreakdown[hospital.zone] = 0;
      }
      const zoneCases = Object.values(cases).reduce((sum, d) => sum + (d.total || 0), 0);
      stats.zoneBreakdown[hospital.zone] += zoneCases;
    });

    // Aggregate lab data
    labs.forEach(lab => {
      const testData = lab.currentState?.testData || {};
      Object.values(testData).forEach(data => {
        stats.totalTests += data.tested || 0;
      });
    });

    return stats;
  }
}

// Singleton instance
const diseaseSimulator = new DiseaseSimulator();

module.exports = diseaseSimulator;

