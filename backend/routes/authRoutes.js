// backend/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Entity = require('../models/Entity');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'healsync_secret_key_2024';

// Register new entity with user account
router.post('/register', async (req, res) => {
  try {
    const { entityData, userData } = req.body;

    // Validate required fields
    if (!entityData || !userData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Entity data and user data are required' 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create entity first
    const entity = new Entity({
      entityType: entityData.entityType,
      name: entityData.name,
      email: entityData.email || userData.email,
      phone: entityData.phone,
      zone: entityData.zone,
      address: entityData.address,
      coordinates: entityData.coordinates,
      profile: entityData.profile || {},
      currentState: entityData.currentState || {},
      status: 'active' // Auto-approve for demo
    });

    await entity.save();

    // Create user account linked to entity
    const user = new User({
      email: userData.email,
      password: userData.password,
      role: entityData.entityType,
      entityId: entity._id,
      name: userData.name || entityData.name,
      status: 'active'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        entityId: entity._id 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        entity: {
          id: entity._id,
          name: entity.name,
          type: entity.entityType,
          zone: entity.zone
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// Login existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email }).populate('entityId');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is inactive or suspended' 
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        entityId: user.entityId?._id 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        entity: user.entityId ? {
          id: user.entityId._id,
          name: user.entityId.name,
          type: user.entityId.entityType,
          zone: user.entityId.zone
        } : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    });
  }
});

// Verify token (for frontend to check if user is still authenticated)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('entityId');

    if (!user || user.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        entity: user.entityId ? {
          id: user.entityId._id,
          name: user.entityId.name,
          type: user.entityId.entityType,
          zone: user.entityId.zone
        } : null
      }
    });

  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token', 
      error: error.message 
    });
  }
});

module.exports = router;

