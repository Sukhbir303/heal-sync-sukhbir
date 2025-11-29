// backend/models/AgentActivity.js
const mongoose = require('mongoose');

const AgentActivitySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  agentType: {
    type: String,
    required: true,
    enum: ['Hospital', 'Lab', 'Pharmacy', 'Supplier', 'City', 'System', 'hospital', 'lab', 'pharmacy', 'supplier', 'city', 'cityadmin', 'system']
  },
  entityId: {
    type: String,
    index: true
  },
  entityName: {
    type: String,
    required: false
  },
  activityType: {
    type: String,
    required: false
  },
  action: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  // For grouping related activities
  scenarioId: {
    type: String,
    index: true
  }
}, {
  timestamps: false,
  collection: 'agent_activities'
});

// Indexes for performance
AgentActivitySchema.index({ timestamp: -1 });
AgentActivitySchema.index({ agentType: 1, timestamp: -1 });
AgentActivitySchema.index({ entityId: 1, timestamp: -1 });

// TTL index - automatically delete activities older than 7 days
AgentActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

// Static method to get recent activities
AgentActivitySchema.statics.getRecent = function(limit = 100) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get activities by agent type
AgentActivitySchema.statics.getByAgent = function(agentType, limit = 50) {
  return this.find({ agentType })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get activities by scenario
AgentActivitySchema.statics.getByScenario = function(scenarioId) {
  return this.find({ scenarioId })
    .sort({ timestamp: 1 }); // Chronological for scenario replay
};

const AgentActivity = mongoose.model('AgentActivity', AgentActivitySchema);

module.exports = AgentActivity;

