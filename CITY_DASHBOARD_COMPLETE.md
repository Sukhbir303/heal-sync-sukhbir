# 🏙️ CITY DASHBOARD - COMPREHENSIVE COMMAND CENTER

## 🎯 Overview

The City Dashboard is the **central command center** for monitoring and managing the entire healthcare system across all zones. It provides:

1. **Real-time Agent Network Visualization** 🌐
2. **Disease Outbreak Scenarios** 🦠
3. **Interactive Charts & Metrics** 📊
4. **Multi-Agent Communication** 💬
5. **Zone-wise Health Monitoring** 🗺️

---

## 🌟 KEY FEATURES

### 1. 🌐 **Agent Communication Network Visualizer**

**Location:** Top section of City Dashboard

**What It Shows:**
- 5 AI agents displayed as colored circles:
  - 🏙️ **City Agent** (Blue) - Center position
  - 🏥 **Hospitals** (Green) - Top
  - 🔬 **Labs** (Purple) - Right
  - 💊 **Pharmacies** (Orange) - Bottom-right
  - 📦 **Suppliers** (Red) - Bottom-left

**Dynamic Features:**
- ✅ **Animated Dashed Lines** - Show when agents communicate
- ✅ **Color-coded Communication** - Blue (normal), Yellow (warning), Red (critical)
- ✅ **Arrows** - Indicate direction of communication
- ✅ **Fade Effect** - Lines fade out after 10 seconds
- ✅ **Hover Effects** - See agent details and connection count
- ✅ **Real-time Updates** - Every 2 seconds

**How It Works:**
```
Agent Sends Message → Activity Log Created → API Fetches Activities → 
Network Visualizer Draws Connection → Line Fades After 10s
```

**Example:**
```
Lab detects outbreak → Sends alert to City Agent
→ Dashed line appears from Lab to City
→ City Agent alerts Hospitals
→ Dashed line appears from City to Hospitals
→ Hospitals request medicines from Pharmacies
→ Dashed line appears from Hospitals to Pharmacies
```

---

### 2. 🦠 **Disease Outbreak Scenarios**

**Location:** Header section (Scenario Control Panel)

**Available Scenarios:**
1. **Dengue Outbreak** 🔴 (Critical severity)
   - Increases dengue test results in affected zones
   - Triggers hospital preparation
   - Pharmacy stock alerts

2. **Typhoid Outbreak** 🟠 (High severity)
   - Similar response pattern
   - Zone-specific alerts

3. **COVID-19 Wave** 🟣 (Critical severity)
   - All zones affected
   - ICU capacity alerts
   - Emergency medicine requests

4. **Malaria Surge** 🟡 (High severity)
   - Zone-specific outbreak
   - Vector control alerts

5. **Seasonal Flu** 🟢 (Medium severity)
   - Widespread but manageable
   - Routine response

**How to Trigger:**
```
1. Click scenario button in header (e.g., "Dengue", "COVID-19")
2. System triggers outbreak:
   - Lab test counts increase
   - ML predictions updated
   - Agents receive alerts
3. Watch network visualizer for agent responses
4. See activity feed for detailed actions
5. Charts update with new data
```

**What Happens When Triggered:**
```
User Clicks "Dengue" →
  Backend increases test results for dengue →
  ML service updates predictions →
  Lab agents detect surge →
  City agent receives alert →
  Hospital agents prepare wards →
  Pharmacy agents check medicine stock →
  Supplier agents prepare shipments →
  Network visualizer shows all communications →
  Charts update with new data
```

---

### 3. 📊 **Interactive Charts**

**Chart 1: Disease Distribution (Doughnut Chart)**
- Shows percentage breakdown of all diseases
- Color-coded:
  - 🔴 Dengue
  - 🟠 Malaria
  - 🟣 COVID-19
  - 🔵 Typhoid
  - 🟢 Influenza
- Displays total test counts
- Percentages calculated automatically

**Chart 2: Hospital Bed Capacity (Stacked Bar Chart)**
- Shows General Beds and ICU Beds
- Green bars = Available
- Red bars = Used
- Stacked to show total capacity
- Percentage tooltips on hover

**Chart 3: Zone-wise Resources (Horizontal Bar Chart)**
- Compares all 3 zones
- Shows:
  - 🟢 Hospital count
  - 🟣 Lab count
  - 🟠 Pharmacy count
  - 🔵 Test volume (÷100 for scale)
- Easy comparison across zones

**Auto-Update:**
- All charts update every 5 seconds
- Real-time data from all agents
- Smooth animations

---

### 4. 🗺️ **Health Heatmap**

**Shows:**
- Zone-wise risk levels
- Color-coded:
  - 🟢 Green = Low risk
  - 🟡 Yellow = Medium risk
  - 🟠 Orange = High risk
  - 🔴 Red = Critical risk
- Interactive hover details
- Population data
- Entity counts per zone

---

### 5. 📋 **Active Alerts**

**Displays:**
- Critical system alerts
- Capacity warnings
- Outbreak notifications
- Supply shortages
- Emergency situations

**Priority Levels:**
- 🔴 Critical (immediate action)
- 🟡 Warning (attention needed)
- 🔵 Info (general updates)

---

### 6. 📊 **City Statistics**

**Quick Overview:**
- Total entities (Hospitals, Labs, Pharmacies, Suppliers)
- System-wide metrics
- Overall health status
- Response times

---

### 7. 💬 **Activity Feed**

**Shows:**
- Real-time agent actions
- Communication logs
- Decision reasoning
- Timestamps
- Severity indicators

**Features:**
- Auto-scrolling
- Color-coded by severity
- Emoji indicators
- "Time ago" formatting
- 30 most recent activities

---

## 🎮 HOW TO USE

### **Scenario 1: Monitor Normal Operations**

```
1. Open City Dashboard
2. View Agent Network - see peaceful state (few connections)
3. Check Charts - disease levels are normal
4. Check Heatmap - all zones green/yellow
5. No critical alerts
```

### **Scenario 2: Trigger Dengue Outbreak**

```
1. Click "Dengue" button in header
2. Observe:
   ✅ Network visualizer shows rapid communication between agents
   ✅ Lab agents detect surge (purple circles active)
   ✅ City agent receives alert (blue circle connects to labs)
   ✅ Hospital agents prepare (green circles active)
   ✅ Pharmacy agents check stock (orange circles active)
   ✅ Disease chart updates - dengue slice grows
   ✅ Activity feed shows agent decisions
   ✅ Heatmap changes color (zones turn orange/red)
3. Read activity feed for detailed agent reasoning
4. Watch charts update in real-time
5. See hospital capacity adjust
```

### **Scenario 3: Multi-Disease Management**

```
1. Trigger Dengue outbreak
2. Wait 1 minute
3. Trigger COVID-19 wave
4. Observe:
   ✅ Network visualizer shows intense activity
   ✅ Multiple disease slices in chart
   ✅ Hospital capacity stressed
   ✅ Multiple alerts in activity feed
   ✅ Agents coordinate responses
   ✅ Supply chain activates
```

### **Scenario 4: Reset System**

```
1. Click "Reset" button
2. All scenarios clear
3. Network calms down
4. Charts return to baseline
5. System ready for new scenario
```

---

## 🔧 TECHNICAL DETAILS

### **Components Created:**

1. **`CityAgentNetwork.jsx`** (New)
   - Canvas-based network visualization
   - Real-time agent communication display
   - Animated connections
   - Hover interactions

2. **`CityDiseaseCharts.jsx`** (New)
   - Chart.js integration
   - 3 interactive charts
   - Auto-updating data
   - Color-coded visualizations

3. **`UnifiedCityDashboard.jsx`** (Enhanced)
   - Integrated all components
   - Scenario management
   - Data fetching from all agents
   - Real-time updates

4. **`ScenarioControlPanel.jsx`** (Existing)
   - Scenario trigger buttons
   - Reset functionality

5. **`EntityActivityFeed.jsx`** (Existing)
   - Activity log display
   - Real-time updates

### **Data Flow:**

```
Backend APIs:
├── GET /api/state (every 5s)
│   └── Returns: { hospitals, labs, pharmacies, suppliers, city }
│
├── GET /api/activities/recent?limit=50 (every 2s)
│   └── Returns: { success, data: [...activities] }
│
├── POST /api/scenarios/:id/trigger
│   └── Triggers outbreak scenario
│   └── Updates lab test counts
│   └── Publishes events
│   └── Agents respond
│
└── POST /api/scenarios/reset
    └── Clears active scenarios
```

### **Network Visualizer Logic:**

```javascript
// Extract communications from activities
activities.forEach(activity => {
  const age = Date.now() - activity.timestamp;
  if (age < 10000) { // Only show last 10 seconds
    const fromAgent = activity.agentType;
    const toAgent = extractTargetFromMessage(activity.message);
    drawConnection(fromAgent, toAgent, opacity);
  }
});

// Draw connections with fade effect
connections.forEach(conn => {
  opacity = 1 - (age / 10000); // Fade over 10s
  drawDashedLine(from, to, opacity, severity);
  drawArrow(midpoint, direction);
});
```

### **Charts Update Logic:**

```javascript
// Disease Chart
diseases = {
  dengue: sum(all labs' dengue tests),
  malaria: sum(all labs' malaria tests),
  covid: sum(all labs' covid tests),
  typhoid: sum(all labs' typhoid tests),
  influenza: sum(all labs' influenza tests)
};

// Capacity Chart
capacity = {
  totalBeds: sum(all hospitals' bed totals),
  usedBeds: sum(all hospitals' beds used),
  totalICU: sum(all hospitals' ICU totals),
  usedICU: sum(all hospitals' ICU used)
};

// Zone Chart
zones.forEach(zone => {
  hospitalCount = count hospitals in zone,
  labCount = count labs in zone,
  pharmacyCount = count pharmacies in zone,
  testVolume = sum tests in zone
});
```

---

## 📊 DATA SOURCES

### **From Hospitals:**
- Bed capacity (General, ICU, Isolation, Pediatric, Maternity)
- Bed occupancy (used vs. available)
- Equipment status
- Staff availability

### **From Labs:**
- Test results by disease
- Daily test volume
- Positive/negative rates
- Testing capacity

### **From Pharmacies:**
- Medicine stock levels
- Low stock alerts
- Orders placed
- Reorder points

### **From Suppliers:**
- Inventory levels
- Active orders
- Delivery capacity
- Supply status

### **From City Agent:**
- Overall system health
- Zone-wise risk levels
- Coordination actions
- Policy decisions

---

## 🎨 VISUAL DESIGN

### **Color Scheme:**
- **Background:** Dark slate (modern, professional)
- **Agents:**
  - City: Blue (#3B82F6)
  - Hospitals: Green (#10B981)
  - Labs: Purple (#8B5CF6)
  - Pharmacies: Orange (#F59E0B)
  - Suppliers: Red (#EF4444)

### **Communication Lines:**
- **Normal:** Blue dashed line
- **Warning:** Yellow dashed line
- **Critical:** Red dashed line
- **Thickness:** 2-3px based on severity

### **Charts:**
- **Professional color palette**
- **Dark background for contrast**
- **Clear labels and legends**
- **Tooltips on hover**
- **Smooth animations**

---

## ✅ TESTING CHECKLIST

### **Test 1: Normal Operations**
```
✅ Dashboard loads
✅ Network shows 5 agents
✅ Charts display data
✅ No critical alerts
✅ Activity feed updates
```

### **Test 2: Dengue Outbreak**
```
✅ Click "Dengue" button
✅ Network shows connections
✅ Disease chart updates
✅ Activity feed shows alerts
✅ Heatmap changes color
✅ Lines fade after 10s
```

### **Test 3: Multiple Scenarios**
```
✅ Trigger Dengue
✅ Trigger COVID-19
✅ Both diseases show in chart
✅ Network very active
✅ Multiple alerts
✅ System handles load
```

### **Test 4: Reset**
```
✅ Click Reset
✅ Scenarios clear
✅ Network calms
✅ Charts return to baseline
```

### **Test 5: Hover Interactions**
```
✅ Hover over agents
✅ See connection count
✅ Agent name displays
✅ Glow effect appears
```

---

## 🚀 BENEFITS

### **For City Officials:**
- ✅ **Complete Visibility** - See entire system at a glance
- ✅ **Real-time Monitoring** - Know what's happening now
- ✅ **Predictive Insights** - Charts show trends
- ✅ **Decision Support** - Activity feed shows AI reasoning
- ✅ **Scenario Planning** - Test outbreak responses safely

### **For AI System:**
- ✅ **Coordination** - Agents communicate efficiently
- ✅ **Learning** - See what works/doesn't work
- ✅ **Optimization** - Identify bottlenecks
- ✅ **Validation** - Verify agent behaviors

### **For Demonstration:**
- ✅ **Impressive Visuals** - Network animation is engaging
- ✅ **Clear Value** - Shows AI in action
- ✅ **Interactive** - Can trigger scenarios live
- ✅ **Professional** - Production-quality UI

---

## 🎯 NEXT STEPS

### **Enhancements (Optional):**
1. **Historical Trends** - Show disease trends over time
2. **Predictive Analytics** - ML forecast of future outbreaks
3. **Resource Optimization** - Suggest entity placements
4. **Performance Metrics** - Track response times
5. **Export Reports** - Generate PDF summaries

---

## 📝 SUMMARY

**You now have a COMPLETE City Command Center with:**

✅ **Real-time Agent Network Visualizer** - See agents communicate
✅ **Disease Outbreak Scenarios** - Trigger Dengue, COVID, Typhoid, etc.
✅ **Interactive Charts** - Disease distribution, capacity, zones
✅ **Health Heatmap** - Zone-wise risk visualization
✅ **Activity Feed** - Real-time agent actions and reasoning
✅ **Scenario Controls** - Easy outbreak triggers and resets

**Everything is:**
- ✅ Clearly interpretable
- ✅ Visually appealing
- ✅ Real-time updating
- ✅ Production-ready
- ✅ Fully functional

---

**🎊 READY TO USE! Open the City Dashboard and trigger a scenario! 🎊**

