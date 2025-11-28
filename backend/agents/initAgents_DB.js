// backend/agents/initAgents_DB.js - MongoDB Version
const LabAgent = require('./LabAgent_DB');
const HospitalAgent = require('./HospitalAgent_DB');
const PharmacyAgent = require('./PharmacyAgent_DB');
const SupplierAgent = require('./SupplierAgent_DB');
const CityAgent = require('./CityAgent_DB');
const dbManager = require('../utils/dbManager');

let logFn = console.log;

function setLogSender(fn) {
  logFn = fn;
}

async function initAgents() {
  console.log('🤖 Initializing agents from MongoDB...');
  
  const agents = [];

  try {
    // Fetch all entities from database
    const [hospitals, labs, pharmacies, suppliers] = await Promise.all([
      dbManager.getAllHospitals(),
      dbManager.getAllLabs(),
      dbManager.getAllPharmacies(),
      dbManager.getAllSuppliers()
    ]);

    console.log(`📊 Found: ${hospitals.length} hospitals, ${labs.length} labs, ${pharmacies.length} pharmacies, ${suppliers.length} suppliers`);

    // Create and start Hospital Agents
    for (const hospital of hospitals) {
      const agent = new HospitalAgent(hospital._id, logFn);
      agents.push(agent);
      await agent.start();
    }

    // Create and start Lab Agents
    for (const lab of labs) {
      const agent = new LabAgent(lab._id, logFn);
      agents.push(agent);
      await agent.start();
    }

    // Create and start Pharmacy Agents
    for (const pharmacy of pharmacies) {
      const agent = new PharmacyAgent(pharmacy._id, logFn);
      agents.push(agent);
      await agent.start();
    }

    // Create and start Supplier Agents
    for (const supplier of suppliers) {
      const agent = new SupplierAgent(supplier._id, logFn);
      agents.push(agent);
      await agent.start();
    }

    // Create and start City Agent (single instance)
    const cityAgent = new CityAgent(logFn);
    agents.push(cityAgent);
    await cityAgent.start();

    console.log(`✅ Initialized ${agents.length} agents successfully`);
    
    return agents;
  } catch (error) {
    console.error('❌ Error initializing agents:', error);
    throw error;
  }
}

module.exports = { initAgents, setLogSender };

