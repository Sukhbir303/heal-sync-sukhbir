# 🗄️ HealSync Database Implementation Guide

## Overview

HealSync has been upgraded from a hardcoded demo system to a **production-ready, database-driven platform** with:
- ✅ MongoDB database integration
- ✅ Dynamic entity onboarding for all 5 roles
- ✅ Real-time metrics logging & analytics
- ✅ Interactive disease outbreak heatmaps
- ✅ Time-series data for predictive analysis
- ✅ Authentication & authorization system

---

## 🏗️ Architecture

### Database Layer

```
MongoDB (Persistent Storage)
    ↓
Mongoose Models (Schema & Validation)
    ↓
Express API Routes (Business Logic)
    ↓
React Frontend (User Interface)
```

### Hybrid Approach

- **In-Memory Cache**: Fast access for real-time agent operations
- **Database Persistence**: Long-term storage for analytics & history
- **Async Sync**: Background writes don't block agent decisions

---

## 📦 Database Models

### 1. **Entity** (`entities` collection)

Stores all entities (hospitals, labs, pharmacies, suppliers, city admin):

```javascript
{
  _id: ObjectId,
  entityType: 'hospital' | 'lab' | 'pharmacy' | 'supplier' | 'cityadmin',
  name: String,
  email: String (unique),
  phone: String,
  zone: String,
  address: String,
  coordinates: { lat: Number, lng: Number },
  status: 'active' | 'pending' | 'suspended' | 'inactive',
  
  // Flexible profile data (varies by entity type)
  profile: {
    // Hospital: { beds, equipment, staff, specialties }
    // Lab: { testingCapacity, equipment, accreditation }
    // Pharmacy: { storageCapacity, operatingHours }
    // Supplier: { serviceZones, logistics }
  },
  
  // Real-time state (changes frequently)
  currentState: {
    // Hospital: { beds: {general: {used: 65}}, equipment: {...} }
    // Lab: { testResults: {dengue: 45}, pendingTests: [...] }
    // Pharmacy: { medicines: {paracetamol: {stock: 4500}} }
  },
  
  joinedAt: Date,
  lastActive: Date
}
```

**Indexes:**
- `entityType + status` (for filtering active entities)
- `zone` (for zone-based queries)
- `coordinates` (2dsphere for geospatial queries)

### 2. **MetricsLog** (`metrics_logs` collection)

Time-series data for analytics:

```javascript
{
  _id: ObjectId,
  timestamp: Date,
  entityId: String,
  entityType: String,
  zone: String,
  
  data: {
    // Flexible schema based on entity type
    // Lab: { dengueTests: 45, positiveRate: 0.65 }
    // Hospital: { beds: {general: {used: 92}} }
    // Pharmacy: { medicines: {paracetamol: {stock: 4500}} }
  },
  
  meta: {} // Optional metadata
}
```

**Indexes:**
- `entityId + timestamp` (for entity history)
- `entityType + timestamp` (for aggregations)
- `zone + timestamp` (for zone analytics)
- TTL index (auto-delete after 30 days)

### 3. **User** (`users` collection)

Authentication accounts:

```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  role: 'hospital' | 'lab' | 'pharmacy' | 'supplier' | 'cityadmin',
  entityId: ObjectId (reference to Entity),
  name: String,
  status: 'active' | 'inactive' | 'suspended',
  lastLogin: Date
}
```

### 4. **AgentActivity** (`agent_activities` collection)

Agent action logs:

```javascript
{
  _id: ObjectId,
  timestamp: Date,
  agentType: 'Hospital' | 'Lab' | 'Pharmacy' | 'Supplier' | 'City',
  entityId: String,
  action: String,
  message: String,
  metadata: {},
  severity: 'info' | 'warning' | 'critical',
  scenarioId: String // For grouping related activities
}
```

**TTL**: Auto-delete after 7 days

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/register`
Register new entity with user account.

**Request:**
```json
{
  "entityData": {
    "entityType": "hospital",
    "name": "Apollo Hospital",
    "email": "apollo@healsync.com",
    "phone": "+91-9876543210",
    "zone": "Zone-1",
    "address": "Andheri West, Mumbai",
    "coordinates": { "lat": 19.1136, "lng": 72.8697 },
    "profile": { /* hospital-specific data */ }
  },
  "userData": {
    "email": "admin@apollo.com",
    "password": "password123",
    "name": "Dr. Admin"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { "id": "...", "email": "...", "role": "hospital" },
    "entity": { "id": "...", "name": "Apollo Hospital", "zone": "Zone-1" }
  }
}
```

#### POST `/api/auth/login`
Login existing user.

**Request:**
```json
{
  "email": "admin@apollo.com",
  "password": "password123"
}
```

**Response:** Same as register

#### GET `/api/auth/verify`
Verify JWT token (requires `Authorization: Bearer <token>` header).

---

### Entities (`/api/entities`)

#### GET `/api/entities`
Get all entities (with optional filters).

**Query Params:**
- `type`: Filter by entity type
- `zone`: Filter by zone
- `status`: Filter by status (default: active)

**Example:** `/api/entities?type=hospital&zone=Zone-1`

#### GET `/api/entities/:id`
Get single entity by ID.

#### PUT `/api/entities/:id/profile`
Update entity profile.

**Request:**
```json
{
  "profile": {
    "beds": { "general": { "total": 120 } }
  }
}
```

#### PUT `/api/entities/:id/state`
Update entity current state (also logs to MetricsLog).

**Request:**
```json
{
  "currentState": {
    "beds": { "general": { "total": 100, "used": 75 } }
  }
}
```

#### GET `/api/entities/:id/metrics`
Get entity metrics history.

**Query Params:**
- `hours`: Time range in hours (default: 24)

---

### Analytics (`/api/analytics`)

#### GET `/api/analytics/heatmap/:diseaseType`
Get heatmap data for disease outbreak.

**Example:** `/api/analytics/heatmap/dengue?hours=24`

**Response:**
```json
{
  "success": true,
  "diseaseType": "dengue",
  "data": [
    {
      "zone": "Zone-2",
      "riskScore": 67.5,
      "severity": "critical",
      "totalTests": 150,
      "positiveCases": 101,
      "labs": [
        {
          "id": "L1",
          "name": "PathLab",
          "coordinates": { "lat": 19.076, "lng": 72.877 }
        }
      ],
      "color": "#DC2626"
    }
  ]
}
```

#### GET `/api/analytics/map/entities`
Get all entities for map visualization.

**Query Params:**
- `type`: Filter by entity type
- `zone`: Filter by zone

#### GET `/api/analytics/trends/:entityId`
Get trend data for a specific metric.

**Query Params:**
- `metric`: Specific metric name
- `hours`: Time range

#### GET `/api/analytics/zones/stats`
Get statistics for all zones.

#### GET `/api/analytics/activities`
Get recent agent activities.

**Query Params:**
- `limit`: Number of activities (default: 100)
- `agentType`: Filter by agent type

---

## 🚀 Setup & Installation

### 1. Install MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Windows:**
Download from https://www.mongodb.com/try/download/community

**Or use MongoDB Atlas (Cloud):**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env` file

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Seed Database

```bash
cd backend
node scripts/seedDatabase.js
```

**This creates:**
- All entities from `worldState.js`
- Default user accounts for each entity
- Initial state data

**Default Credentials:**
```
Hospitals:  h1@healsync.com / password123
Labs:       l1@healsync.com / password123
Pharmacies: p1@healsync.com / password123
Suppliers:  s1@healsync.com / password123
City Admin: cityadmin@healsync.com / admin123
```

### 4. Start Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**Check health:**
```bash
curl http://localhost:4000/health
```

Response:
```json
{
  "status": "running",
  "database": "connected",
  "timestamp": "2024-11-28T10:30:00.000Z"
}
```

---

## 🎯 Registration Flow

### Step 1: User selects role
- Hospital 🏥
- Laboratory 🔬
- Pharmacy 💊
- Supplier 📦
- City Admin 🏛️

### Step 2: Fill role-specific form

**Hospital Form:**
- Basic info (name, zone, address, coordinates)
- Bed capacity (general, ICU, isolation, pediatric, maternity)
- Equipment (ventilators, oxygen, X-ray, CT, ambulances)
- Staff (doctors, nurses, specialists)
- Admin account credentials

**Lab Form:**
- Basic info
- Testing capacity (dengue, malaria, COVID, typhoid)
- Admin account

**Pharmacy Form:**
- Basic info
- Admin account

**Supplier Form:**
- Company info
- Warehouse location
- Admin account

**City Admin Form:**
- Department info
- Official credentials

### Step 3: Submit registration

Backend:
1. Validates data
2. Creates Entity record in database
3. Creates User account (password hashed)
4. Generates JWT token
5. Returns token + user/entity data

Frontend:
1. Stores token in localStorage
2. Updates AuthContext
3. Redirects to role-specific dashboard

### Step 4: Access dashboard

User is now logged in and can access their dashboard with real-time data from the database.

---

## 🗺️ Heatmap Visualization

### How it Works

1. **Data Collection:**
   - Labs log test results to MetricsLog every time tests are conducted
   - Each log includes: dengue/malaria/COVID test counts, positive rates, zone

2. **Aggregation:**
   - `/api/analytics/heatmap/:diseaseType` endpoint aggregates data by zone
   - Calculates risk scores: `(positiveCases / totalTests) * 100`

3. **Risk Severity:**
   - **Critical** (🔴): >60% positive rate
   - **High** (🟠): 30-60%
   - **Medium** (🟡): 10-30%
   - **Low** (🟢): <10%

4. **Visualization:**
   - Leaflet.js map with OpenStreetMap tiles
   - Colored circles (radius = risk score * 150m)
   - Markers for each lab
   - Clickable popups with details

5. **Real-time Updates:**
   - Fetches fresh data every 10 seconds
   - Automatically updates when scenarios are triggered

### Usage in City Dashboard

```javascript
import DiseaseHeatmap from '../components/DiseaseHeatmap';

<DiseaseHeatmap diseaseType="dengue" height="600px" />
```

**Props:**
- `diseaseType`: 'dengue' | 'malaria' | 'covid' | 'typhoid'
- `height`: CSS height (default: '600px')

---

## 📊 Metrics Logging System

### Automatic Logging

When entity state is updated via `/api/entities/:id/state`, a MetricsLog entry is automatically created:

```javascript
// Update hospital bed state
PUT /api/entities/H1/state
{
  "currentState": {
    "beds": { "general": { "total": 100, "used": 75 } }
  }
}

// Automatically logs to MetricsLog:
{
  "timestamp": "2024-11-28T14:30:00Z",
  "entityId": "H1",
  "entityType": "hospital",
  "zone": "Zone-1",
  "data": {
    "beds": { "general": { "total": 100, "used": 75 } }
  }
}
```

### Manual Logging

```javascript
const MetricsLog = require('./models/MetricsLog');

await MetricsLog.create({
  entityId: 'L1',
  entityType: 'lab',
  zone: 'Zone-2',
  data: {
    dengueTests: 45,
    positiveRate: 0.67
  }
});
```

### Querying Metrics

```javascript
// Get recent metrics for an entity
const metrics = await MetricsLog.getRecent('H1', 24); // Last 24 hours

// Get metrics by zone
const zoneMetrics = await MetricsLog.getByZone('Zone-2', 12); // Last 12 hours

// Aggregate by disease
const aggregated = await MetricsLog.aggregateByDisease('dengue', 24);
```

---

## 🔐 Authentication in Frontend

### Setup AuthContext

Already implemented in `frontend/src/contexts/AuthContext.jsx`:

```javascript
const { user, token, login, logout } = useAuth();
```

### Protecting Routes

```javascript
import { useAuth } from '../contexts/AuthContext';

function HospitalDashboard() {
  const { user, logout } = useAuth();
  
  if (!user || user.role !== 'hospital') {
    return <Navigate to="/" />;
  }
  
  // Dashboard content...
}
```

### Making Authenticated Requests

```javascript
const { token } = useAuth();

const response = await fetch('http://localhost:4000/api/entities/H1', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🎮 Demo Flow

### 1. Fresh Start
```bash
# Clear database
mongo healsync --eval "db.dropDatabase()"

# Reseed with demo data
node backend/scripts/seedDatabase.js

# Start servers
npm run dev (in both backend and frontend)
```

### 2. Show Registration
1. Go to http://localhost:5173
2. Click "✨ Register Entity"
3. Select "Hospital"
4. Fill form with:
   - Name: "Demo Hospital"
   - Zone: Zone-3
   - Address: "Test Location"
   - Beds, Equipment, Staff (any numbers)
   - Admin credentials
5. Submit → Auto-login → Redirects to Hospital Dashboard

### 3. Show Existing Login
1. Go to http://localhost:5173
2. Click "🔐 Professional Login"
3. Login as: `cityadmin@healsync.com` / `admin123`
4. Access City Dashboard

### 4. Show Heatmap
1. In City Dashboard, scroll to heatmap section
2. Trigger "🦟 Dengue" scenario
3. Watch heatmap update in real-time with red zones
4. Click on markers to see lab details
5. View zone statistics below map

### 5. Show Analytics
1. Navigate to `/api/analytics/heatmap/dengue`
2. Show JSON response with zone risk scores
3. Navigate to `/api/analytics/zones/stats`
4. Show zone statistics

---

## 🏆 Production Deployment

### Environment Variables

Create `.env` in backend:
```env
MONGODB_URI=mongodb://localhost:27017/healsync
PORT=4000
NODE_ENV=production
JWT_SECRET=your_secure_random_string_here
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healsync?retryWrites=true&w=majority
```

### Security Best Practices

1. **Password Hashing:** ✅ Already implemented with bcrypt
2. **JWT Tokens:** ✅ 7-day expiry, secure secret
3. **CORS:** ⚠️ Update to specific frontend URL in production:
   ```javascript
   cors({
     origin: 'https://your-frontend-domain.com'
   })
   ```
4. **HTTPS:** Use SSL certificates
5. **Rate Limiting:** Add express-rate-limit
6. **Input Validation:** Add express-validator

### Scaling Considerations

1. **Database Indexes:** ✅ Already optimized
2. **Connection Pooling:** Mongoose handles this
3. **Caching:** Add Redis for frequently accessed data
4. **Load Balancing:** Use nginx for multiple backend instances
5. **CDN:** Serve static frontend assets via CDN

---

## 📚 Next Steps

### Phase 1: Current ✅
- ✅ MongoDB integration
- ✅ Entity registration
- ✅ Authentication system
- ✅ Metrics logging
- ✅ Heatmap visualization

### Phase 2: Enhance (Optional)
- 🔲 Migrate agents to use database
- 🔲 Real-time notifications (WebSocket + DB)
- 🔲 Advanced analytics dashboard
- 🔲 Predictive models (ML integration)
- 🔲 Multi-city support

### Phase 3: Production (Optional)
- 🔲 Deployment scripts
- 🔲 Monitoring & logging (Sentry, LogRocket)
- 🔲 Backup & disaster recovery
- 🔲 Admin panel for entity management
- 🔲 API rate limiting & security hardening

---

## 🐛 Troubleshooting

### Database Connection Failed

**Error:** `MongoDB connection error: connect ECONNREFUSED`

**Solution:**
1. Check if MongoDB is running: `brew services list` (macOS) or `sudo systemctl status mongodb` (Linux)
2. Start MongoDB: `brew services start mongodb-community` or `sudo systemctl start mongodb`
3. Check connection string in code (default: `mongodb://localhost:27017/healsync`)

### Frontend Not Connecting to Backend

**Error:** `Failed to fetch`

**Solution:**
1. Check backend is running on port 4000
2. Check CORS is enabled in `backend/server.js`
3. Verify API URL in frontend (should be `http://localhost:4000`)

### Seed Script Fails

**Error:** Various errors during seeding

**Solution:**
1. Drop existing database: `mongo healsync --eval "db.dropDatabase()"`
2. Re-run seed script: `node backend/scripts/seedDatabase.js`
3. Check MongoDB connection first

### Heatmap Not Loading

**Error:** Map doesn't render

**Solution:**
1. Check Leaflet CSS is imported: `import 'leaflet/dist/leaflet.css';`
2. Check backend analytics API is responding: `curl http://localhost:4000/api/analytics/heatmap/dengue`
3. Check browser console for errors

---

## 📞 Support

For issues or questions:
1. Check console logs (frontend & backend)
2. Check MongoDB logs: `tail -f /usr/local/var/log/mongodb/mongo.log` (macOS)
3. Review API responses in Network tab (browser DevTools)

---

**Built with ❤️ for HealSync - Production-Ready Healthcare Coordination Platform**

