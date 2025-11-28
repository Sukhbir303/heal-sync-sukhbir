// backend/models/Entity.js
const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
  // Common fields for all entity types
  entityType: {
    type: String,
    required: true,
    enum: ['hospital', 'lab', 'pharmacy', 'supplier', 'cityadmin']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  zone: {
    type: String,
    required: function() {
      return this.entityType !== 'cityadmin' && this.entityType !== 'supplier';
    }
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended', 'inactive'],
    default: 'active'
  },
  
  // Role-specific profile data (flexible schema)
  profile: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Current state (real-time data that changes frequently)
  currentState: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Metadata
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'entities'
});

// Indexes for performance
EntitySchema.index({ entityType: 1, status: 1 });
EntitySchema.index({ zone: 1 });
EntitySchema.index({ coordinates: '2dsphere' }); // For geospatial queries

// Virtual for getting entity ID as string
EntitySchema.virtual('entityId').get(function() {
  return this._id.toString();
});

// Method to update last active timestamp
EntitySchema.methods.updateActivity = function() {
  this.lastActive = Date.now();
  return this.save();
};

// Static method to get entities by zone
EntitySchema.statics.getByZone = function(zone, entityType = null) {
  const query = { zone, status: 'active' };
  if (entityType) query.entityType = entityType;
  return this.find(query);
};

// Static method to get active entities by type
EntitySchema.statics.getActiveByType = function(entityType) {
  return this.find({ entityType, status: 'active' });
};

const Entity = mongoose.model('Entity', EntitySchema);

module.exports = Entity;

