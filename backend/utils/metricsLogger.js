// Metrics Logger - Records time-series data for graphs
const MetricsLog = require('../models/MetricsLog');

class MetricsLogger {
  /**
   * Log hospital metrics
   */
  static async logHospitalMetrics(entityId, state) {
    try {
      const beds = state.beds || {};
      const totalBeds = Object.values(beds).reduce((sum, b) => sum + (b.total || 0), 0);
      const usedBeds = Object.values(beds).reduce((sum, b) => sum + (b.used || 0), 0);
      
      await MetricsLog.create({
        entityId,
        entityType: 'hospital',
        metrics: {
          bedOccupancy: totalBeds > 0 ? ((usedBeds / totalBeds) * 100).toFixed(1) : 0,
          totalBeds,
          usedBeds,
          availableBeds: totalBeds - usedBeds,
          icuOccupancy: beds.icu ? ((beds.icu.used / beds.icu.total) * 100).toFixed(1) : 0,
          erWaitTime: state.patientMetrics?.erWaitingTime || 0,
          admissions: state.patientMetrics?.admissionsToday || 0,
          discharges: state.patientMetrics?.dischargesPerDay || 0
        }
      });
    } catch (error) {
      console.error('Error logging hospital metrics:', error.message);
    }
  }

  /**
   * Log lab metrics
   */
  static async logLabMetrics(entityId, testData) {
    try {
      const testsToday = Object.values(testData).reduce((sum, t) => sum + (t.today || 0), 0);
      const positiveTests = Object.values(testData).reduce((sum, t) => sum + (t.positive || 0), 0);
      
      await MetricsLog.create({
        entityId,
        entityType: 'lab',
        metrics: {
          testsToday,
          positiveTests,
          positiveRate: testsToday > 0 ? ((positiveTests / testsToday) * 100).toFixed(1) : 0,
          dengueTests: testData.dengue?.today || 0,
          covidTests: testData.covid?.today || 0,
          malariaTests: testData.malaria?.today || 0,
          typhoidTests: testData.typhoid?.today || 0,
          influenzaTests: testData.influenza?.today || 0
        }
      });
    } catch (error) {
      console.error('Error logging lab metrics:', error.message);
    }
  }

  /**
   * Log pharmacy metrics
   */
  static async logPharmacyMetrics(entityId, state) {
    try {
      const medicines = state.medicines || {};
      const inventory = Object.values(medicines);
      const totalStock = inventory.reduce((sum, m) => sum + (m.stock || 0), 0);
      const lowStock = inventory.filter(m => m.stock < (m.reorderLevel || 0));
      
      await MetricsLog.create({
        entityId,
        entityType: 'pharmacy',
        metrics: {
          totalStock,
          lowStockCount: lowStock.length,
          activeOrders: (state.activeOrders || []).length,
          medicineTypes: Object.keys(medicines).length
        }
      });
    } catch (error) {
      console.error('Error logging pharmacy metrics:', error.message);
    }
  }

  /**
   * Log supplier metrics
   */
  static async logSupplierMetrics(entityId, state) {
    try {
      const inventory = state.inventory || {};
      const items = Object.values(inventory);
      const totalInventory = items.reduce((sum, i) => sum + (i.stock || 0), 0);
      const lowInventory = items.filter(i => i.stock < 100);
      
      await MetricsLog.create({
        entityId,
        entityType: 'supplier',
        metrics: {
          totalInventory,
          lowInventoryCount: lowInventory.length,
          activeOrders: (state.activeOrders || []).length,
          itemTypes: Object.keys(inventory).length,
          deliveriesScheduled: items.filter(i => i.deliveryETA).length
        }
      });
    } catch (error) {
      console.error('Error logging supplier metrics:', error.message);
    }
  }

  /**
   * Get metrics for charting
   */
  static async getMetrics(entityId, hours = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      return await MetricsLog.find({
        entityId,
        timestamp: { $gte: since }
      }).sort({ timestamp: 1 }).limit(100);
    } catch (error) {
      console.error('Error fetching metrics:', error.message);
      return [];
    }
  }

  /**
   * Clean old metrics (keep last 7 days only)
   */
  static async cleanup() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const result = await MetricsLog.deleteMany({
        timestamp: { $lt: sevenDaysAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} old metrics`);
      }
    } catch (error) {
      console.error('Error cleaning up metrics:', error.message);
    }
  }
}

// Run cleanup once per day
setInterval(() => {
  MetricsLogger.cleanup();
}, 24 * 60 * 60 * 1000);

module.exports = MetricsLogger;

