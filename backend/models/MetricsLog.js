// backend/models/MetricsLog.js
const mongoose = require('mongoose');

const MetricsLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  entityId: {
    type: String,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['hospital', 'lab', 'pharmacy', 'supplier', 'cityadmin'],
    index: true
  },
  zone: {
    type: String,
    index: true
  },
  
  // Flexible data structure for different metrics
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Optional metadata
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: false, // We use our own timestamp field
  collection: 'metrics_logs'
});

// Compound indexes for common queries
MetricsLogSchema.index({ entityId: 1, timestamp: -1 });
MetricsLogSchema.index({ entityType: 1, timestamp: -1 });
MetricsLogSchema.index({ zone: 1, timestamp: -1 });
MetricsLogSchema.index({ timestamp: -1 }); // For recent metrics

// TTL index - automatically delete logs older than 30 days
MetricsLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

// Static method to get recent metrics
MetricsLogSchema.statics.getRecent = function(entityId, hours = 24) {
  const since = new Date(Date.now() - hours * 3600000);
  return this.find({
    entityId,
    timestamp: { $gte: since }
  }).sort({ timestamp: -1 });
};

// Static method to get metrics by zone
MetricsLogSchema.statics.getByZone = function(zone, hours = 24) {
  const since = new Date(Date.now() - hours * 3600000);
  return this.find({
    zone,
    timestamp: { $gte: since }
  }).sort({ timestamp: -1 });
};

// Static method to aggregate data by disease type
MetricsLogSchema.statics.aggregateByDisease = async function(diseaseType, hours = 24) {
  const since = new Date(Date.now() - hours * 3600000);
  
  return this.aggregate([
    {
      $match: {
        entityType: 'lab',
        timestamp: { $gte: since },
        [`data.${diseaseType}Tests`]: { $exists: true }
      }
    },
    {
      $group: {
        _id: '$zone',
        totalTests: { $sum: `$data.${diseaseType}Tests` },
        avgPositiveRate: { $avg: '$data.positiveRate' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        zone: '$_id',
        totalTests: 1,
        avgPositiveRate: 1,
        estimatedCases: {
          $multiply: ['$totalTests', '$avgPositiveRate']
        },
        count: 1
      }
    },
    {
      $sort: { estimatedCases: -1 }
    }
  ]);
};

const MetricsLog = mongoose.model('MetricsLog', MetricsLogSchema);

module.exports = MetricsLog;

