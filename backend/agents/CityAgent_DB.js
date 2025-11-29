// backend/agents/CityAgent_DB.js - MongoDB Version
const { subscribe, publish } = require('../eventBus');
const EVENTS = require('../constants/events');
const dbManager = require('../utils/dbManager');
const ActivityLogger = require('../utils/activityLogger');

class CityAgent {
  constructor(log) {
    this.log = log;
    this.cityEntityId = null; // Will be set on start()

    // Subscribe to all major events for city-wide monitoring
    subscribe('DENGUE_OUTBREAK_PREDICTED', this.onOutbreak.bind(this, 'dengue'));
    subscribe('MALARIA_OUTBREAK_PREDICTED', this.onOutbreak.bind(this, 'malaria'));
    subscribe('TYPHOID_OUTBREAK_PREDICTED', this.onOutbreak.bind(this, 'typhoid'));
    subscribe('INFLUENZA_OUTBREAK_PREDICTED', this.onOutbreak.bind(this, 'influenza'));
    subscribe('COVID_OUTBREAK_PREDICTED', this.onOutbreak.bind(this, 'covid'));
    
    subscribe('HOSPITAL_OVERLOAD_RISK', this.onHospitalOverload.bind(this));
    subscribe('MEDICINE_SHORTAGE_RISK', this.onMedicineShortage.bind(this));
    subscribe('LAB_CAPACITY_WARNING', this.onLabCapacity.bind(this));
    subscribe('EQUIPMENT_SHORTAGE', this.onEquipmentShortage.bind(this));
  }

  async start() {
    // Use static city ID for activity logging
    this.cityEntityId = 'CITY_ADMIN';

    this.log(
      `✅ City Agent initialized - Coordinating citywide healthcare across all zones`,
      { agent: 'City', type: 'INIT', entityId: this.cityEntityId }
    );

    // Log initialization to database
    try {
      await ActivityLogger.log(
        this.cityEntityId,
        'City',
        'SYSTEM_START',
        '✅ City Agent initialized - Coordinating citywide healthcare across all zones',
        { action: 'initialize', entityName: 'City Health Department' }
      );
    } catch (error) {
      console.log('Activity logging skipped (DB not ready)');
    }

    // Periodic city health summary every 15 seconds
    setInterval(() => this.tick(), 15000);
  }

  async tick() {
    // Get city-wide summary from database
    const summary = await dbManager.getCityWideSummary();
    
    if (!summary) return;

    const bedUtilization = summary.bedOccupancy;
    const bedsAvailable = summary.totalBeds - summary.usedBeds;
    
    // Assess overall risk status
    const riskLevel = bedUtilization > 80 ? 'high' : bedUtilization > 60 ? 'medium' : 'low';
    const statusEmoji = riskLevel === 'high' ? '🔴' : riskLevel === 'medium' ? '🟡' : '🟢';
    const statusText = riskLevel === 'high' ? 'HIGH-RISK' : riskLevel === 'medium' ? 'MONITORING' : 'STABLE';
    
    const message = `${statusEmoji} City Health: ${statusText} | ${summary.hospitals} hospitals, ${summary.labs} labs | ${bedsAvailable}/${summary.totalBeds} beds (${bedUtilization.toFixed(1)}% used)`;
    
    this.log(
      `🏙️ ${message}`,
      { 
        agent: 'City', 
        type: 'STATUS', 
        entityId: this.cityEntityId,
        overallRisk: riskLevel,
        ...summary
      }
    );

    // Log monitoring activity to database
    try {
      await ActivityLogger.logMonitoring(
        this.cityEntityId,
        'City',
        'all_agents',
        `👁️ Monitoring citywide health: ${summary.hospitals} hospitals, ${summary.labs} labs, ${summary.pharmacies} pharmacies - Status: ${statusText}`,
        {
          action: 'monitor',
          riskLevel,
          bedUtilization: bedUtilization.toFixed(1),
          bedsAvailable,
          totalBeds: summary.totalBeds,
          entityName: 'City Health Department'
        }
      );
    } catch (error) {
      // Skip if DB not ready
    }
  }

  async onOutbreak(disease, event) {
    const alertMessage = `🚨 ${disease.toUpperCase()} outbreak detected in ${event.zone} | Risk: ${event.riskLevel} | Lab: ${event.labName} reports ${event.today} cases (+${event.growthRate}% spike)`;
    
    this.log(
      `CITY ALERT: ${alertMessage}`,
      { 
        agent: 'City', 
        type: 'OUTBREAK_DETECTED', 
        entityId: this.cityEntityId,
        disease,
        zone: event.zone,
        riskLevel: event.riskLevel,
        labId: event.labId
      }
    );

    // Log alert to database
    try {
      await ActivityLogger.logAlert(
        this.cityEntityId,
        'City',
        'OUTBREAK_DETECTED',
        alertMessage,
        event.riskLevel === 'high' ? 'critical' : 'warning',
        {
          disease,
          zone: event.zone,
          cases: event.today,
          growthRate: event.growthRate,
          labName: event.labName,
          action: 'outbreak_alert',
          entityName: 'City Health Department'
        }
      );

      // Log communication: Lab → City
      await ActivityLogger.logCommunication(
        this.cityEntityId,
        'City',
        'Lab',
        `📥 Received outbreak alert from ${event.labName} - ${disease} cases increasing in ${event.zone}`,
        {
          disease,
          zone: event.zone,
          sourceAgent: 'Lab',
          entityName: 'City Health Department'
        }
      );

      // Log communication: City → Hospitals & Pharmacies
      await ActivityLogger.logCommunication(
        this.cityEntityId,
        'City',
        'Hospital',
        `📤 Alert sent to hospitals in ${event.zone} - Prepare for ${disease} cases`,
        {
          disease,
          zone: event.zone,
          targetAgent: 'Hospital',
          entityName: 'City Health Department'
        }
      );

      await ActivityLogger.logCommunication(
        this.cityEntityId,
        'City',
        'Pharmacy',
        `📤 Alert sent to pharmacies in ${event.zone} - Check ${disease} medicine stock`,
        {
          disease,
          zone: event.zone,
          targetAgent: 'Pharmacy',
          entityName: 'City Health Department'
        }
      );
    } catch (error) {
      // Skip if DB not ready
    }

    // Log coordination actions
    const coordMessage = `📋 Monitoring ${disease} response in ${event.zone} - Hospitals and Pharmacies alerted`;
    this.log(
      `CITY COORDINATION: ${coordMessage}`,
      { 
        agent: 'City', 
        type: 'COORDINATION', 
        entityId: this.cityEntityId,
        disease,
        zone: event.zone,
        action: 'monitor_response'
      }
    );
  }

  async onHospitalOverload(event) {
    this.log(
      `⚠️ CITY ALERT: Hospital capacity warning - ${event.name} (${event.zone}) at ${Math.round(event.occupancy * 100)}% occupancy (${event.predictedBeds}/${event.totalBeds} beds)`,
      { 
        agent: 'City', 
        type: 'CAPACITY_ALERT', 
        entityId: 'CITY',
        hospitalId: event.hospitalId,
        zone: event.zone,
        occupancy: event.occupancy
      }
    );

    // Check for nearby hospitals with capacity
    const zoneHospitals = await dbManager.getEntitiesByZone(event.zone, 'hospital');
    const availableHospitals = zoneHospitals.filter(h => {
      if (!h.currentState?.beds) return false;
      const totalBeds = Object.values(h.currentState.beds).reduce((sum, bed) => sum + (bed.total || 0), 0);
      const usedBeds = Object.values(h.currentState.beds).reduce((sum, bed) => sum + (bed.used || 0), 0);
      return (usedBeds / totalBeds) < 0.7; // Less than 70% occupied
    });

    if (availableHospitals.length > 0) {
      this.log(
        `📍 CITY COORDINATION: ${availableHospitals.length} nearby hospitals with capacity available - ${availableHospitals.map(h => h.name).join(', ')}`,
        { 
          agent: 'City', 
          type: 'RESOURCE_AVAILABLE', 
          entityId: 'CITY',
          zone: event.zone,
          availableHospitals: availableHospitals.map(h => h.name)
        }
      );
    } else {
      this.log(
        `🚨 CITY ALERT: Critical - No spare capacity in ${event.zone}! All hospitals near capacity.`,
        { 
          agent: 'City', 
          type: 'CRITICAL_SHORTAGE', 
          entityId: 'CITY',
          zone: event.zone,
          resource: 'hospital_beds'
        }
      );
    }
  }

  async onMedicineShortage(event) {
    this.log(
      `💊 CITY ALERT: Medicine shortage risk - ${event.pharmacyName} (${event.zone}): ${event.medicine} at ${event.stock} units (~${event.daysLeft} days)`,
      { 
        agent: 'City', 
        type: 'MEDICINE_ALERT', 
        entityId: 'CITY',
        pharmacyId: event.pharmacyId,
        medicine: event.medicine,
        urgency: event.urgency
      }
    );

    // Check if this is city-wide issue
    const zonePharmacies = await dbManager.getEntitiesByZone(event.zone, 'pharmacy');
    const shortageCount = zonePharmacies.filter(p => {
      return p.currentState?.medicines?.[event.medicine]?.stock < 200;
    }).length;

    if (shortageCount > 1) {
      this.log(
        `🚨 CITY COORDINATION: Multiple pharmacies in ${event.zone} report ${event.medicine} shortage (${shortageCount}/${zonePharmacies.length}) - Coordinating with suppliers`,
        { 
          agent: 'City', 
          type: 'COORDINATION', 
          entityId: 'CITY',
          zone: event.zone,
          medicine: event.medicine,
          affectedCount: shortageCount
        }
      );
    }
  }

  async onLabCapacity(event) {
    this.log(
      `🔬 CITY ALERT: Lab capacity warning in ${event.zone} - ${(event.utilization * 100).toFixed(1)}% capacity (${event.totalTests}/${event.totalCapacity} tests)`,
      { 
        agent: 'City', 
        type: 'LAB_ALERT', 
        entityId: 'CITY',
        labId: event.labId,
        zone: event.zone,
        utilization: event.utilization
      }
    );
  }

  async onEquipmentShortage(event) {
    this.log(
      `🏥 CITY ALERT: Critical equipment shortage - ${event.equipment} at hospital in ${event.zone}: ${event.available}/${event.total} available`,
      { 
        agent: 'City', 
        type: 'EQUIPMENT_ALERT', 
        entityId: 'CITY',
        hospitalId: event.hospitalId,
        equipment: event.equipment,
        zone: event.zone
      }
    );
  }
}

module.exports = CityAgent;

