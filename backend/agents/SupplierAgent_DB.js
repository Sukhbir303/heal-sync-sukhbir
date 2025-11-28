// backend/agents/SupplierAgent_DB.js - MongoDB Version
const { subscribe, publish } = require('../eventBus');
const EVENTS = require('../constants/events');
const dbManager = require('../utils/dbManager');
const Entity = require('../models/Entity');

class SupplierAgent {
  constructor(entityId, log) {
    this.entityId = entityId;
    this.log = log;
    this.entity = null;

    subscribe('MEDICINE_SHORTAGE_RISK', this.onMedicineShortage.bind(this));
    subscribe('HOSPITAL_OVERLOAD_RISK', this.onHospitalOverload.bind(this));
    subscribe('EQUIPMENT_SHORTAGE', this.onEquipmentShortage.bind(this));
  }

  async start() {
    // Load supplier data from database
    this.entity = await Entity.findById(this.entityId);
    
    if (!this.entity) {
      console.error(`Supplier ${this.entityId} not found in database`);
      return;
    }

    // Initialize inventory if not exists
    if (!this.entity.currentState.inventory) {
      this.entity.currentState.inventory = {
        dengueMed: { stock: 5000, incoming: 0 },
        chloroquine: { stock: 3000, incoming: 0 },
        paracetamol: { stock: 10000, incoming: 0 },
        oseltamivir: { stock: 2000, incoming: 0 },
        ventilators: { stock: 50, incoming: 0 },
        oxygenCylinders: { stock: 500, incoming: 0 },
        ppe: { stock: 10000, incoming: 0 }
      };
      this.entity.currentState.activeOrders = [];
      await this.entity.save();
    }

    const itemCount = Object.keys(this.entity.currentState.inventory || {}).length;
    this.log(
      `✅ Supplier Agent ${this.entity.name} initialized - ${itemCount} items in warehouse`,
      { agent: 'Supplier', type: 'INIT', entityId: this.entityId.toString() }
    );

    setInterval(() => this.tick(), 15000);
  }

  async tick() {
    // Reload fresh data from database
    this.entity = await Entity.findById(this.entityId);
    if (!this.entity || !this.entity.currentState.inventory) return;

    const state = this.entity.currentState;

    // Count low inventory items
    const lowStockItems = Object.entries(state.inventory).filter(([_, item]) => {
      const stock = item.stock || item;
      return typeof stock === 'number' && stock < 100;
    }).length;

    const activeOrders = state.activeOrders?.length || 0;

    const status = activeOrders > 2 ? '🟡 BUSY' : '🟢 READY';
    this.log(
      `${this.entity.name}: ${status} | ${activeOrders} active orders | ${lowStockItems} low stock alerts`,
      { agent: 'Supplier', type: 'STATUS', entityId: this.entityId.toString(), activeOrders, lowStockItems }
    );

    // Check for low inventory levels
    this.checkInventoryLevels(state);
    
    // Process pending orders
    await this.processActiveOrders(state);

    // Save updated state to database
    this.entity.markModified('currentState');
    await this.entity.save();
    
    // Log metrics
    await dbManager.logMetrics(
      this.entityId,
      'supplier',
      this.entity.zone,
      {
        inventory: state.inventory,
        activeOrders: activeOrders,
        lowStockItems
      }
    );
  }

  checkInventoryLevels(state) {
    Object.keys(state.inventory).forEach(item => {
      const itemData = state.inventory[item];
      const stock = itemData.stock || itemData;
      
      if (typeof stock === 'number' && stock < 100) {
        this.log(
          `[Supplier ${this.entity.name}] Low inventory warning: ${item} = ${stock} units`,
          { agent: 'Supplier', type: 'LOW_INVENTORY', item, stock }
        );
      }
    });
  }

  async processActiveOrders(state) {
    if (state.activeOrders && state.activeOrders.length > 0) {
      const prioritizedOrders = this.prioritizeOrders(state.activeOrders);
      
      for (const order of prioritizedOrders.slice(0, 3)) {
        await this.fulfillOrder(state, order);
      }
    }
  }

  prioritizeOrders(orders) {
    return orders.sort((a, b) => {
      const scoreA = this.calculateOrderPriority(a);
      const scoreB = this.calculateOrderPriority(b);
      return scoreB - scoreA;
    });
  }

  calculateOrderPriority(order) {
    let score = 0;
    
    // Urgency scoring
    if (order.urgency === 'critical') score += 100;
    else if (order.urgency === 'high') score += 75;
    else if (order.urgency === 'medium') score += 50;
    else score += 25;
    
    // Criticality scoring
    if (order.criticality === 'high') score += 50;
    else if (order.criticality === 'medium') score += 30;
    else score += 10;
    
    // Order age (older = higher priority)
    const orderAge = Date.now() - new Date(order.timestamp).getTime();
    const hoursOld = orderAge / (1000 * 60 * 60);
    score += Math.min(hoursOld * 2, 30);
    
    return score;
  }

  async fulfillOrder(state, order) {
    const item = order.medicine || order.item;
    const quantity = order.quantity;
    
    // Check if we have stock
    const inventory = state.inventory[item];
    if (!inventory) return;
    
    const availableStock = inventory.stock || inventory;
    
    if (typeof availableStock === 'number' && availableStock >= quantity) {
      // Fulfill order
      inventory.stock = availableStock - quantity;
      
      // Remove from active orders
      state.activeOrders = state.activeOrders.filter(o => o !== order);
      
      // Get pharmacy entity if this is a medicine order
      let recipientName = order.pharmacyName || order.recipientName || 'Unknown Recipient';
      
      this.log(
        `📦 ${this.entity.name}: Fulfilled order for ${recipientName} - Delivered ${quantity} units of ${item}`,
        { 
          agent: 'Supplier', 
          type: 'DELIVERY_COMPLETE', 
          entityId: this.entityId.toString(), 
          item,
          quantity,
          recipient: recipientName
        }
      );
      
      this.log(
        `✅ ${this.entity.name}: Confirmed delivery of ${item} to ${recipientName} (${quantity} units delivered)`,
        { 
          agent: 'Supplier', 
          type: 'SUPPLY_CONFIRMED', 
          entityId: this.entityId.toString(), 
          item,
          quantity,
          recipient: recipientName
        }
      );
    } else if (typeof availableStock === 'number') {
      this.log(
        `⚠️ ${this.entity.name}: Insufficient stock for ${item} - Requested: ${quantity}, Available: ${availableStock}`,
        { agent: 'Supplier', type: 'SUPPLY_SHORTAGE', entityId: this.entityId.toString(), item, requested: quantity, available: availableStock }
      );
    }
  }

  async onMedicineShortage(event) {
    // Reload entity
    this.entity = await Entity.findById(this.entityId);
    if (!this.entity) return;

    const state = this.entity.currentState;

    this.log(
      `📩 ${this.entity.name}: Received ${event.urgency} priority order from ${event.pharmacyName} for ${event.medicine} (${event.orderQuantity} units)`,
      { 
        agent: 'Supplier', 
        type: 'ORDER_RECEIVED', 
        entityId: this.entityId.toString(),
        pharmacyId: event.pharmacyId,
        medicine: event.medicine,
        urgency: event.urgency
      }
    );

    // Add to active orders
    if (!state.activeOrders) state.activeOrders = [];
    
    state.activeOrders.push({
      pharmacyId: event.pharmacyId,
      pharmacyName: event.pharmacyName,
      medicine: event.medicine,
      quantity: event.orderQuantity,
      urgency: event.urgency,
      criticality: event.criticality,
      timestamp: new Date().toISOString(),
      zone: event.zone
    });

    this.log(
      `📝 ${this.entity.name}: Order added to queue - ${state.activeOrders.length} orders pending`,
      { agent: 'Supplier', type: 'ORDER_QUEUED', entityId: this.entityId.toString(), queueSize: state.activeOrders.length }
    );

    // Save state
    this.entity.markModified('currentState');
    await this.entity.save();
  }

  async onHospitalOverload(event) {
    this.log(
      `🏥 ${this.entity.name}: Alert - Hospital ${event.name} in ${event.zone} at ${Math.round(event.occupancy * 100)}% capacity`,
      { agent: 'Supplier', type: 'HOSPITAL_ALERT', entityId: this.entityId.toString(), hospitalId: event.hospitalId }
    );
  }

  async onEquipmentShortage(event) {
    // Reload entity
    this.entity = await Entity.findById(this.entityId);
    if (!this.entity) return;

    const state = this.entity.currentState;

    this.log(
      `🚨 ${this.entity.name}: Critical equipment shortage at ${event.hospitalId} - ${event.equipment}: ${event.available}/${event.total}`,
      { agent: 'Supplier', type: 'EQUIPMENT_SHORTAGE_ALERT', entityId: this.entityId.toString(), hospitalId: event.hospitalId, equipment: event.equipment }
    );

    // Add emergency equipment order
    if (!state.activeOrders) state.activeOrders = [];
    
    state.activeOrders.push({
      hospitalId: event.hospitalId,
      item: event.equipment,
      quantity: Math.ceil((event.total - event.available) * 0.5), // Order half of shortage
      urgency: 'critical',
      criticality: 'high',
      timestamp: new Date().toISOString(),
      zone: event.zone
    });

    // Save state
    this.entity.markModified('currentState');
    await this.entity.save();
  }
}

module.exports = SupplierAgent;

