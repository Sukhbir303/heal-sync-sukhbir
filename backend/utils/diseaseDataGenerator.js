// Disease Data Generator - Creates realistic disease statistics
const diseases = ['dengue', 'malaria', 'typhoid', 'covid', 'influenza'];

class DiseaseDataGenerator {
  /**
   * Generate random test results for a lab
   * @param {Object} options - Configuration options
   * @returns {Object} Test data by disease
   */
  static generateLabTestData(options = {}) {
    const {
      capacity = 1000,
      baseLoad = 0.3, // 30% of capacity
      outbreakDisease = null,
      outbreakMultiplier = 3
    } = options;

    const testData = {};
    
    diseases.forEach(disease => {
      const isOutbreak = disease === outbreakDisease;
      const multiplier = isOutbreak ? outbreakMultiplier : 1;
      
      // Random test volume (20-80% of capacity)
      const testVolume = Math.floor(
        capacity * baseLoad * (0.5 + Math.random() * 1.0) * multiplier
      );
      
      // Positive rate (5-30% normally, 30-60% during outbreak)
      const basePositiveRate = isOutbreak ? 0.3 + Math.random() * 0.3 : 0.05 + Math.random() * 0.25;
      const positiveTests = Math.floor(testVolume * basePositiveRate);
      
      testData[disease] = {
        tested: testVolume,
        positive: positiveTests,
        negative: testVolume - positiveTests,
        positiveRate: ((positiveTests / testVolume) * 100).toFixed(1),
        today: testVolume,
        thisWeek: Math.floor(testVolume * (6 + Math.random() * 2))
      };
    });

    return testData;
  }

  /**
   * Generate disease cases for a hospital
   * @param {Object} options - Configuration options
   * @returns {Object} Disease case data
   */
  static generateHospitalCaseData(options = {}) {
    const {
      totalBeds = 150,
      currentOccupancy = 0.4,
      outbreakDisease = null,
      outbreakMultiplier = 2.5
    } = options;

    const caseData = {};
    const occupiedBeds = Math.floor(totalBeds * currentOccupancy);
    
    // Distribute cases across diseases
    let remainingCases = occupiedBeds;
    
    diseases.forEach((disease, index) => {
      const isOutbreak = disease === outbreakDisease;
      const isLast = index === diseases.length - 1;
      
      let casesForDisease;
      if (isLast) {
        casesForDisease = remainingCases; // Assign remaining
      } else {
        const baseShare = isOutbreak ? 0.4 : (0.1 + Math.random() * 0.15);
        casesForDisease = Math.floor(remainingCases * baseShare);
        if (isOutbreak) {
          casesForDisease = Math.floor(casesForDisease * outbreakMultiplier);
        }
      }
      
      // Ensure we don't exceed total
      casesForDisease = Math.min(casesForDisease, remainingCases);
      remainingCases -= casesForDisease;
      
      // Generate case severity distribution
      const critical = Math.floor(casesForDisease * (0.1 + Math.random() * 0.15));
      const serious = Math.floor(casesForDisease * (0.2 + Math.random() * 0.2));
      const moderate = casesForDisease - critical - serious;
      
      caseData[disease] = {
        total: casesForDisease,
        active: casesForDisease,
        critical,
        serious,
        moderate,
        recovered: Math.floor(casesForDisease * (5 + Math.random() * 10)), // Weekly recoveries
        deaths: Math.floor(critical * (0.05 + Math.random() * 0.1)), // 5-15% mortality for critical
        newToday: Math.floor(casesForDisease * (0.1 + Math.random() * 0.15)),
        trend: isOutbreak ? 'increasing' : (Math.random() > 0.5 ? 'stable' : 'decreasing')
      };
    });

    return caseData;
  }

  /**
   * Generate medicine demand based on disease prevalence
   * @param {Object} diseaseData - Current disease case data
   * @returns {Object} Medicine demand by type
   */
  static generateMedicineDemand(diseaseData) {
    const medicineDemand = {
      paracetamol: 0,    // General fever/pain
      antibiotics: 0,     // Bacterial infections
      antivirals: 0,      // Viral infections
      dengueMed: 0,       // Dengue specific
      chloroquine: 0,     // Malaria
      ceftriaxone: 0,     // Typhoid
      oseltamivir: 0,     // Influenza/COVID
      covidMed: 0         // COVID specific
    };

    // Map diseases to medicines
    const diseaseMedicineMap = {
      dengue: ['dengueMed', 'paracetamol'],
      malaria: ['chloroquine', 'antibiotics'],
      typhoid: ['ceftriaxone', 'antibiotics'],
      covid: ['covidMed', 'oseltamivir', 'antivirals'],
      influenza: ['oseltamivir', 'antivirals', 'paracetamol']
    };

    // Calculate demand based on cases
    Object.entries(diseaseData).forEach(([disease, data]) => {
      const medicines = diseaseMedicineMap[disease] || [];
      const casesPerDay = data.newToday || data.total || 0;
      
      medicines.forEach(medicine => {
        // Each case needs 7-14 days of medicine
        const dailyDosePerPatient = 2 + Math.random() * 2; // 2-4 doses per day
        const treatmentDays = 7 + Math.random() * 7; // 7-14 days
        medicineDemand[medicine] += Math.ceil(casesPerDay * dailyDosePerPatient * treatmentDays);
      });
    });

    return medicineDemand;
  }

  /**
   * Generate realistic stock levels for pharmacy
   * @param {Object} demand - Medicine demand
   * @returns {Object} Stock data
   */
  static generatePharmacyStock(demand, options = {}) {
    const {
      lowStock = false,
      outbreakMedicine = null
    } = options;

    const stock = {};
    
    Object.keys(demand).forEach(medicine => {
      const dailyDemand = demand[medicine] || 50;
      const isOutbreakMed = medicine === outbreakMedicine;
      
      // Normal stock: 10-30 days supply
      // Low stock: 1-5 days supply
      // Outbreak medicine: 2-7 days supply
      let daysSupply;
      if (isOutbreakMed) {
        daysSupply = 2 + Math.random() * 5;
      } else if (lowStock) {
        daysSupply = 1 + Math.random() * 4;
      } else {
        daysSupply = 10 + Math.random() * 20;
      }
      
      const stockLevel = Math.floor(dailyDemand * daysSupply);
      const reorderLevel = Math.floor(dailyDemand * 7); // 7 days
      
      stock[medicine] = {
        stock: stockLevel,
        dailyUsage: Math.ceil(dailyDemand),
        reorderLevel,
        daysRemaining: (stockLevel / dailyDemand).toFixed(1),
        status: stockLevel < reorderLevel ? 'low' : 'normal',
        lastRestocked: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    });

    return stock;
  }

  /**
   * Generate supplier inventory
   * @returns {Object} Inventory data
   */
  static generateSupplierInventory() {
    const medicines = ['paracetamol', 'antibiotics', 'antivirals', 'dengueMed', 
                      'chloroquine', 'ceftriaxone', 'oseltamivir', 'covidMed'];
    
    const inventory = {};
    
    medicines.forEach(medicine => {
      // Suppliers have large stock
      const baseStock = 10000 + Math.random() * 40000;
      
      inventory[medicine] = {
        available: Math.floor(baseStock),
        reserved: Math.floor(baseStock * (0.1 + Math.random() * 0.2)),
        unitPrice: (5 + Math.random() * 45).toFixed(2),
        minOrderQuantity: 50 + Math.floor(Math.random() * 150)
      };
    });

    return inventory;
  }

  /**
   * Simulate disease spread over time
   * @param {Object} currentData - Current disease data
   * @param {String} trendingDisease - Disease that's trending
   * @returns {Object} Updated disease data
   */
  static simulateDiseaseProgression(currentData, trendingDisease = null) {
    const updated = {};
    
    Object.entries(currentData).forEach(([disease, data]) => {
      const isTrending = disease === trendingDisease;
      
      // Calculate growth rate (-10% to +50% for trending, -10% to +10% for others)
      const growthRate = isTrending 
        ? 0.1 + Math.random() * 0.4 
        : -0.1 + Math.random() * 0.2;
      
      const newTotal = Math.max(0, Math.floor(data.total * (1 + growthRate)));
      
      updated[disease] = {
        ...data,
        total: newTotal,
        active: newTotal,
        newToday: Math.floor(newTotal * (0.1 + Math.random() * 0.1)),
        trend: growthRate > 0.05 ? 'increasing' : growthRate < -0.05 ? 'decreasing' : 'stable'
      };
    });

    return updated;
  }

  /**
   * Generate zone-wise disease distribution
   * @param {Array} zones - Zone identifiers
   * @returns {Object} Disease data by zone
   */
  static generateZoneDiseaseData(zones = ['Zone-1', 'Zone-2', 'Zone-3']) {
    const zoneData = {};
    
    zones.forEach(zone => {
      // Random outbreak in some zones
      const hasOutbreak = Math.random() > 0.7;
      const outbreakDisease = hasOutbreak ? diseases[Math.floor(Math.random() * diseases.length)] : null;
      
      zoneData[zone] = {
        riskLevel: hasOutbreak ? 'high' : (Math.random() > 0.6 ? 'medium' : 'low'),
        primaryDisease: outbreakDisease || diseases[Math.floor(Math.random() * diseases.length)],
        totalCases: Math.floor(100 + Math.random() * 400),
        activeCases: Math.floor(50 + Math.random() * 200),
        diseases: this.generateHospitalCaseData({ 
          totalBeds: 500, 
          currentOccupancy: 0.3 + Math.random() * 0.3,
          outbreakDisease
        })
      };
    });

    return zoneData;
  }

  /**
   * Get disease metadata
   * @param {String} disease - Disease name
   * @returns {Object} Disease information
   */
  static getDiseaseInfo(disease) {
    const info = {
      dengue: {
        name: 'Dengue Fever',
        type: 'viral',
        vector: 'mosquito',
        incubation: '4-7 days',
        symptoms: ['High fever', 'Severe headache', 'Joint/muscle pain', 'Rash'],
        severity: 'medium-high',
        treatment: ['Supportive care', 'Hydration', 'Pain relief'],
        prevention: ['Mosquito control', 'Protective clothing']
      },
      malaria: {
        name: 'Malaria',
        type: 'parasitic',
        vector: 'mosquito',
        incubation: '10-15 days',
        symptoms: ['Fever', 'Chills', 'Sweating', 'Headache'],
        severity: 'high',
        treatment: ['Antimalarial drugs', 'Supportive care'],
        prevention: ['Bed nets', 'Prophylaxis', 'Mosquito control']
      },
      typhoid: {
        name: 'Typhoid Fever',
        type: 'bacterial',
        vector: 'waterborne',
        incubation: '6-30 days',
        symptoms: ['Sustained fever', 'Weakness', 'Abdominal pain'],
        severity: 'medium',
        treatment: ['Antibiotics', 'Hydration'],
        prevention: ['Safe water', 'Hygiene', 'Vaccination']
      },
      covid: {
        name: 'COVID-19',
        type: 'viral',
        vector: 'airborne',
        incubation: '2-14 days',
        symptoms: ['Fever', 'Cough', 'Shortness of breath', 'Loss of taste/smell'],
        severity: 'medium-high',
        treatment: ['Antivirals', 'Oxygen therapy', 'Supportive care'],
        prevention: ['Vaccination', 'Masks', 'Social distancing']
      },
      influenza: {
        name: 'Influenza',
        type: 'viral',
        vector: 'airborne',
        incubation: '1-4 days',
        symptoms: ['Fever', 'Cough', 'Body aches', 'Fatigue'],
        severity: 'low-medium',
        treatment: ['Antivirals', 'Rest', 'Fluids'],
        prevention: ['Vaccination', 'Hand hygiene']
      }
    };

    return info[disease] || {
      name: disease,
      type: 'unknown',
      severity: 'medium'
    };
  }
}

module.exports = DiseaseDataGenerator;

