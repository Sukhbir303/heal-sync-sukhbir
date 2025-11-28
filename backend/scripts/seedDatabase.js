// backend/scripts/seedDatabase.js
const mongoose = require('mongoose');
const Entity = require('../models/Entity');
const User = require('../models/User');
const worldState = require('../worldState');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healsync';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Entity.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const entities = [];
    const users = [];

    // Seed Hospitals
    console.log('🏥 Seeding hospitals...');
    for (const [id, hospital] of Object.entries(worldState.hospitals)) {
      const entity = await Entity.create({
        entityType: 'hospital',
        name: hospital.name,
        email: `${id.toLowerCase()}@healsync.com`,
        phone: hospital.contact?.phone || '+91-9876543210',
        zone: hospital.zone,
        address: hospital.address,
        coordinates: hospital.coordinates,
        profile: {
          type: hospital.type,
          beds: hospital.beds,
          equipment: hospital.equipment,
          staff: hospital.staff,
          specialties: hospital.specialties
        },
        currentState: {
          beds: hospital.beds,
          equipment: hospital.equipment,
          patientMetrics: hospital.patientMetrics
        },
        status: 'active'
      });
      
      entities.push(entity);
      
      // Create default user for each hospital
      users.push({
        email: `${id.toLowerCase()}@healsync.com`,
        password: 'password123',
        role: 'hospital',
        entityId: entity._id,
        name: hospital.name,
        status: 'active'
      });
    }
    console.log(`✅ Created ${Object.keys(worldState.hospitals).length} hospitals`);

    // Seed Labs
    console.log('🔬 Seeding labs...');
    for (const [id, lab] of Object.entries(worldState.labs)) {
      const entity = await Entity.create({
        entityType: 'lab',
        name: lab.name,
        email: `${id.toLowerCase()}@healsync.com`,
        phone: lab.contact?.phone || '+91-9876543211',
        zone: lab.zone,
        address: lab.address,
        coordinates: lab.coordinates,
        profile: {
          type: lab.type,
          testingCapacity: lab.testingCapacity,
          equipment: lab.equipment,
          accreditation: lab.accreditation
        },
        currentState: {
          testResults: lab.testResults,
          pendingTests: lab.pendingTests
        },
        status: 'active'
      });
      
      entities.push(entity);
      
      users.push({
        email: `${id.toLowerCase()}@healsync.com`,
        password: 'password123',
        role: 'lab',
        entityId: entity._id,
        name: lab.name,
        status: 'active'
      });
    }
    console.log(`✅ Created ${Object.keys(worldState.labs).length} labs`);

    // Seed Pharmacies
    console.log('💊 Seeding pharmacies...');
    for (const [id, pharmacy] of Object.entries(worldState.pharmacies)) {
      const entity = await Entity.create({
        entityType: 'pharmacy',
        name: pharmacy.name,
        email: `${id.toLowerCase()}@healsync.com`,
        phone: pharmacy.contact?.phone || '+91-9876543212',
        zone: pharmacy.zone,
        address: pharmacy.address,
        coordinates: pharmacy.coordinates,
        profile: {
          type: pharmacy.type,
          license: pharmacy.license,
          storageCapacity: pharmacy.storageCapacity,
          operatingHours: pharmacy.operatingHours
        },
        currentState: {
          medicines: pharmacy.medicines,
          orders: pharmacy.orders || []
        },
        status: 'active'
      });
      
      entities.push(entity);
      
      users.push({
        email: `${id.toLowerCase()}@healsync.com`,
        password: 'password123',
        role: 'pharmacy',
        entityId: entity._id,
        name: pharmacy.name,
        status: 'active'
      });
    }
    console.log(`✅ Created ${Object.keys(worldState.pharmacies).length} pharmacies`);

    // Seed Suppliers
    console.log('📦 Seeding suppliers...');
    for (const [id, supplier] of Object.entries(worldState.suppliers)) {
      const entity = await Entity.create({
        entityType: 'supplier',
        name: supplier.name,
        email: `${id.toLowerCase()}@healsync.com`,
        phone: supplier.contact?.phone || '+91-9876543213',
        zone: supplier.zone || 'Central',
        address: supplier.address || 'Warehouse Location',
        coordinates: supplier.coordinates,
        profile: {
          type: supplier.type,
          fleet: supplier.fleet,
          constraints: supplier.constraints
        },
        currentState: {
          inventory: supplier.inventory,
          pendingOrders: supplier.pendingOrders || []
        },
        status: 'active'
      });
      
      entities.push(entity);
      
      users.push({
        email: `${id.toLowerCase()}@healsync.com`,
        password: 'password123',
        role: 'supplier',
        entityId: entity._id,
        name: supplier.name,
        status: 'active'
      });
    }
    console.log(`✅ Created ${Object.keys(worldState.suppliers).length} suppliers`);

    // Seed City Admin
    console.log('🏛️  Creating city admin...');
    const cityAdminEntity = await Entity.create({
      entityType: 'cityadmin',
      name: 'Mumbai Municipal Corporation - Health Department',
      email: 'cityadmin@healsync.com',
      phone: '+91-9876543200',
      zone: 'City-Wide',
      address: 'Municipal Headquarters, Mumbai',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      profile: {
        department: 'Public Health Department',
        jurisdiction: ['Zone-1', 'Zone-2', 'Zone-3', 'Zone-4'],
        permissions: [
          'view-all-entities',
          'trigger-scenarios',
          'redistribute-resources',
          'issue-alerts'
        ]
      },
      currentState: {},
      status: 'active'
    });
    
    entities.push(cityAdminEntity);
    
    users.push({
      email: 'cityadmin@healsync.com',
      password: 'admin123',
      role: 'cityadmin',
      entityId: cityAdminEntity._id,
      name: 'City Admin',
      status: 'active'
    });
    console.log('✅ Created city admin');

    // Create users
    console.log('👥 Creating user accounts...');
    for (const userData of users) {
      await User.create(userData);
    }
    console.log(`✅ Created ${users.length} user accounts`);

    console.log('\n📊 Seeding Summary:');
    console.log(`   Hospitals: ${Object.keys(worldState.hospitals).length}`);
    console.log(`   Labs: ${Object.keys(worldState.labs).length}`);
    console.log(`   Pharmacies: ${Object.keys(worldState.pharmacies).length}`);
    console.log(`   Suppliers: ${Object.keys(worldState.suppliers).length}`);
    console.log(`   City Admin: 1`);
    console.log(`   Total Entities: ${entities.length}`);
    console.log(`   Total Users: ${users.length}`);
    
    console.log('\n🔑 Default Credentials:');
    console.log('   Hospitals: h1@healsync.com / password123');
    console.log('   Labs: l1@healsync.com / password123');
    console.log('   Pharmacies: p1@healsync.com / password123');
    console.log('   Suppliers: s1@healsync.com / password123');
    console.log('   City Admin: cityadmin@healsync.com / admin123');

    console.log('\n✅ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedDatabase;

