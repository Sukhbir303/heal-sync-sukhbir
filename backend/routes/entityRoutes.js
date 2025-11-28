// backend/routes/entityRoutes.js
const express = require('express');
const Entity = require('../models/Entity');
const MetricsLog = require('../models/MetricsLog');

const router = express.Router();

// Get all entities (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, zone, status } = req.query;
    const filter = {};
    
    if (type) filter.entityType = type;
    if (zone) filter.zone = zone;
    if (status) filter.status = status;
    else filter.status = 'active'; // Default to active only

    const entities = await Entity.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      count: entities.length,
      data: entities
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch entities', 
      error: error.message 
    });
  }
});

// Get single entity by ID
router.get('/:id', async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id);
    
    if (!entity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Entity not found' 
      });
    }

    res.json({
      success: true,
      data: entity
    });
  } catch (error) {
    console.error('Error fetching entity:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch entity', 
      error: error.message 
    });
  }
});

// Update entity profile
router.put('/:id/profile', async (req, res) => {
  try {
    const { profile } = req.body;
    
    const entity = await Entity.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          profile,
          lastActive: Date.now()
        } 
      },
      { new: true, runValidators: true }
    );

    if (!entity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Entity not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: entity
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
});

// Update entity current state
router.put('/:id/state', async (req, res) => {
  try {
    const { currentState } = req.body;
    
    const entity = await Entity.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          currentState,
          lastActive: Date.now()
        } 
      },
      { new: true, runValidators: true }
    );

    if (!entity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Entity not found' 
      });
    }

    // Log metrics if state contains measurable data
    if (currentState && Object.keys(currentState).length > 0) {
      await MetricsLog.create({
        entityId: entity._id.toString(),
        entityType: entity.entityType,
        zone: entity.zone,
        data: currentState,
        timestamp: Date.now()
      });
    }

    res.json({
      success: true,
      message: 'State updated successfully',
      data: entity
    });
  } catch (error) {
    console.error('Error updating state:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update state', 
      error: error.message 
    });
  }
});

// Get entities by zone
router.get('/zone/:zoneName', async (req, res) => {
  try {
    const { zoneName } = req.params;
    const { type } = req.query;

    const entities = await Entity.getByZone(zoneName, type || null);

    res.json({
      success: true,
      zone: zoneName,
      count: entities.length,
      data: entities
    });
  } catch (error) {
    console.error('Error fetching entities by zone:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch entities', 
      error: error.message 
    });
  }
});

// Get entities by type
router.get('/type/:entityType', async (req, res) => {
  try {
    const { entityType } = req.params;

    const entities = await Entity.getActiveByType(entityType);

    res.json({
      success: true,
      type: entityType,
      count: entities.length,
      data: entities
    });
  } catch (error) {
    console.error('Error fetching entities by type:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch entities', 
      error: error.message 
    });
  }
});

// Delete entity (soft delete by setting status to inactive)
router.delete('/:id', async (req, res) => {
  try {
    const entity = await Entity.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!entity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Entity not found' 
      });
    }

    res.json({
      success: true,
      message: 'Entity deleted successfully',
      data: entity
    });
  } catch (error) {
    console.error('Error deleting entity:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete entity', 
      error: error.message 
    });
  }
});

// Get entity metrics/history
router.get('/:id/metrics', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const entityId = req.params.id;

    const metrics = await MetricsLog.getRecent(entityId, parseInt(hours));

    res.json({
      success: true,
      entityId,
      count: metrics.length,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch metrics', 
      error: error.message 
    });
  }
});

module.exports = router;

