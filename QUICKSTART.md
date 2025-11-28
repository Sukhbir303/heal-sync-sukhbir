# 🚀 HealSync Quick Start Guide

Get HealSync running in 5 minutes!

## Prerequisites

- Node.js (v16+)
- MongoDB (or MongoDB Atlas account)
- npm or yarn

---

## Step 1: Install MongoDB (Choose one)

### Option A: Local MongoDB (Recommended for Demo)

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
sudo systemctl enable mongodb
```

**Windows:**
Download installer from: https://www.mongodb.com/try/download/community

### Option B: MongoDB Atlas (Cloud - Free Tier)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster (M0)
3. Get connection string
4. Skip to Step 3 and use your Atlas connection string

---

## Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is running
brew services list  # macOS
# or
sudo systemctl status mongodb  # Linux

# Test connection
mongo  # Should open MongoDB shell
```

---

## Step 3: Install Dependencies

### Backend
```bash
cd backend
npm install
```

**Expected output:**
```
added 151 packages in 5s
```

### Frontend
```bash
cd frontend
npm install
```

**Expected output:**
```
added 319 packages in 8s
```

---

## Step 4: Seed Database with Demo Data

```bash
cd backend
node scripts/seedDatabase.js
```

**Expected output:**
```
🌱 Starting database seeding...
✅ Connected to MongoDB
🗑️  Cleared existing data
🏥 Seeding hospitals...
✅ Created 4 hospitals
🔬 Seeding labs...
✅ Created 2 labs
💊 Seeding pharmacies...
✅ Created 3 pharmacies
📦 Seeding suppliers...
✅ Created 2 suppliers
🏛️  Creating city admin...
✅ Created city admin
👥 Creating user accounts...
✅ Created 12 user accounts

📊 Seeding Summary:
   Hospitals: 4
   Labs: 2
   Pharmacies: 3
   Suppliers: 2
   City Admin: 1
   Total Entities: 12
   Total Users: 12

🔑 Default Credentials:
   Hospitals: h1@healsync.com / password123
   Labs: l1@healsync.com / password123
   Pharmacies: p1@healsync.com / password123
   Suppliers: s1@healsync.com / password123
   City Admin: cityadmin@healsync.com / admin123

✅ Database seeding completed successfully!
```

---

## Step 5: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected: localhost
✅ Backend server listening on port 4000
📊 Database: Connected
```

**Keep this terminal open!**

---

## Step 6: Start Frontend Server

**Open a NEW terminal:**

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 7: Access the Application

### 🌐 Open Browser

**Public Dashboard:** http://localhost:5173

### 🔐 Login with Default Accounts

Click "Professional Login" and use any of these:

| Role | Email | Password |
|------|-------|----------|
| **City Admin** | cityadmin@healsync.com | admin123 |
| Hospital H1 | h1@healsync.com | password123 |
| Hospital H2 | h2@healsync.com | password123 |
| Lab L1 | l1@healsync.com | password123 |
| Pharmacy P1 | p1@healsync.com | password123 |
| Supplier S1 | s1@healsync.com | password123 |

---

## Step 8: Test Key Features

### ✨ Test 1: Register New Entity

1. Go to http://localhost:5173
2. Click **"✨ Register Entity"**
3. Select **"Hospital"**
4. Fill in the form:
   - Name: "Test Hospital"
   - Zone: Zone-3
   - Any values for beds/equipment
   - Create admin account
5. Submit
6. ✅ Should auto-login and redirect to Hospital Dashboard

### 🏛️ Test 2: City Dashboard & Scenarios

1. Login as: `cityadmin@healsync.com` / `admin123`
2. You'll see:
   - Agent Status Bar (all agents)
   - Scenario Triggers (Dengue, Malaria, COVID, etc.)
   - Coordination Timeline
   - Agent Network Diagram
3. Click **"🦟 Dengue"**
4. Watch:
   - Timeline updates with agent activities
   - Network diagram animates connections
   - Impact summary shows results

### 🗺️ Test 3: Disease Heatmap

1. In City Dashboard, scroll down
2. You'll see an interactive map
3. After triggering dengue scenario, the map shows:
   - Red zones (high risk)
   - Lab markers
   - Clickable popups with details
4. Click on any zone to see statistics

### 📊 Test 4: API Endpoints

**Health Check:**
```bash
curl http://localhost:4000/health
```

**Get All Entities:**
```bash
curl http://localhost:4000/api/entities
```

**Get Heatmap Data:**
```bash
curl http://localhost:4000/api/analytics/heatmap/dengue
```

**Get Zone Statistics:**
```bash
curl http://localhost:4000/api/analytics/zones/stats
```

---

## 🎯 Demo Flow (for Presentations)

### Part 1: Public Dashboard (30 sec)
1. Open http://localhost:5173
2. Show public health metrics
3. Show active alerts
4. Highlight "Anyone can view this - no login required"

### Part 2: Registration (1 min)
1. Click "Register Entity"
2. Select "Hospital"
3. Fill form quickly (use sample data)
4. Show it auto-creates account and logs you in
5. **Pitch:** "Any hospital can join the network in 2 minutes"

### Part 3: City Dashboard (2 min)
1. Logout, login as City Admin
2. Show agent network diagram
3. Trigger "Dengue Outbreak"
4. Watch the cascade:
   - Lab detects outbreak
   - Hospitals prepare beds
   - Pharmacies order medicines
   - Suppliers confirm delivery
5. **Pitch:** "All autonomous, no human intervention"

### Part 4: Heatmap (1 min)
1. Scroll to disease heatmap
2. Show zones colored by risk level
3. Click on high-risk zone
4. Show lab markers and statistics
5. **Pitch:** "Real-time visualization of city-wide health"

### Part 5: Impact (30 sec)
1. Show impact summary:
   - X patients helped
   - Y beds allocated
   - Z medicines delivered
2. **Pitch:** "AI prevented a crisis before it happened"

**Total Demo Time: 5 minutes**

---

## 🛠️ Common Issues & Fixes

### Issue 1: MongoDB Connection Failed

**Error:** `MongoDB connection error: connect ECONNREFUSED`

**Fix:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### Issue 2: Port 4000 Already in Use

**Error:** `EADDRINUSE: address already in use :::4000`

**Fix:**
```bash
# Find and kill the process
lsof -ti:4000 | xargs kill -9

# Then restart backend
cd backend && npm run dev
```

### Issue 3: Frontend Can't Connect to Backend

**Error:** `Failed to fetch` in browser console

**Fix:**
1. Check backend is running: `curl http://localhost:4000/health`
2. If not, restart backend: `cd backend && npm run dev`
3. Clear browser cache and reload

### Issue 4: Heatmap Not Showing

**Fix:**
1. Check Leaflet CSS loaded (no console errors)
2. Trigger a scenario first (dengue/malaria)
3. Wait 5-10 seconds for data to populate
4. Check API: `curl http://localhost:4000/api/analytics/heatmap/dengue`

### Issue 5: No Data in Database

**Fix:**
```bash
# Reseed database
cd backend
node scripts/seedDatabase.js
```

---

## 📊 System Requirements

### Minimum
- RAM: 4GB
- Storage: 1GB
- CPU: Dual-core
- Network: Localhost only

### Recommended (for production)
- RAM: 8GB+
- Storage: 10GB+ (for logs)
- CPU: Quad-core+
- Network: High-speed internet

---

## 🔄 Resetting Everything

If something goes wrong, start fresh:

```bash
# Stop all servers (Ctrl+C in both terminals)

# Drop database
mongo healsync --eval "db.dropDatabase()"

# Reseed
cd backend
node scripts/seedDatabase.js

# Restart servers
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev  # Terminal 2
```

---

## 📚 Next Steps

- **Read Full Documentation:** [`DATABASE_IMPLEMENTATION.md`](./DATABASE_IMPLEMENTATION.md)
- **Understand Architecture:** [`README.md`](./README.md)
- **View Project Summary:** [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md)
- **Learn Agent System:** [`DYNAMIC_FEATURES_SUMMARY.md`](./DYNAMIC_FEATURES_SUMMARY.md)

---

## 🎉 Success Checklist

- [ ] MongoDB running
- [ ] Backend started on port 4000
- [ ] Frontend started on port 5173
- [ ] Database seeded with demo data
- [ ] Can access http://localhost:5173
- [ ] Can login with default credentials
- [ ] Can register new entity
- [ ] Can trigger scenarios
- [ ] Heatmap displays correctly
- [ ] Agent activities log in real-time

**If all checkboxes are ✅, you're ready to go!** 🚀

---

## 🆘 Still Having Issues?

1. Check backend logs in terminal
2. Check frontend console (F12 in browser)
3. Check MongoDB logs: `tail -f /usr/local/var/log/mongodb/mongo.log`
4. Review [`DATABASE_IMPLEMENTATION.md`](./DATABASE_IMPLEMENTATION.md) for detailed troubleshooting

---

**Happy Coding! 🎯**

