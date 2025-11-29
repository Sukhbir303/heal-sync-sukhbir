# 🚀 HealSync - Complete System Startup Guide

## ✅ **All Services Now Running!**

```
┌─────────────────────────────────────────┐
│  ✅ Frontend (React)                    │
│     Port: 5173                          │
│     Status: RUNNING                     │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  ✅ Backend (Node.js)                   │
│     Port: 4000                          │
│     Status: RUNNING                     │
│     Agents: 24 ACTIVE                   │
└─────────────────────────────────────────┘
              ↕                    ↕
┌──────────────────────┐  ┌────────────────┐
│  ✅ MongoDB Atlas    │  │  ✅ ML Service │
│     Cloud Database   │  │     Port: 8000 │
│     CONNECTED        │  │     RUNNING    │
└──────────────────────┘  └────────────────┘
```

---

## 🎯 **Quick Start Commands**

### **1. Backend (Node.js)**

```bash
cd backend
./start.sh
# OR
npm run restart:dev
```

**What it does:**
- Kills port 4000 if busy
- Starts Node.js server
- Initializes 24 AI agents
- Connects to MongoDB Atlas

---

### **2. Frontend (React)**

```bash
cd frontend
npm run dev
```

**Access at:** http://localhost:5173

---

### **3. ML Service (Python)**

```bash
cd backend/ml_service
./start-ml.sh
# OR manually:
source .venv/bin/activate
python main.py
```

**Access at:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

---

## 🔧 **Handling Port Conflicts**

### **Backend (Port 4000)**

```bash
# Kill port 4000
lsof -ti:4000 | xargs kill -9

# Or use npm script
cd backend && npm run kill-port
```

### **ML Service (Port 8000)**

```bash
# Kill port 8000
lsof -ti:8000 | xargs kill -9

# Or use the startup script (auto-kills)
cd backend/ml_service && ./start-ml.sh
```

### **Frontend (Port 5173)**

```bash
# Kill port 5173
lsof -ti:5173 | xargs kill -9
```

---

## 📊 **Verify All Services**

### **Backend:**
```bash
curl http://localhost:4000/health
# Expected: {"status":"running","database":"connected"}
```

### **Frontend:**
```bash
curl -I http://localhost:5173
# Expected: HTTP/1.1 200 OK
```

### **ML Service:**
```bash
curl http://localhost:8000/
# Expected: {"service":"HealSync ML Service","status":"operational"}
```

---

## 🎮 **Complete Demo Flow**

### **Step 1: Start All Services**

```bash
# Terminal 1 - Backend
cd backend && npm run restart:dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - ML Service (Optional)
cd backend/ml_service && ./start-ml.sh
```

### **Step 2: Access Dashboards**

- **Public Dashboard:** http://localhost:5173/
- **City Dashboard:** http://localhost:5173/city
- **Hospital Dashboard:** http://localhost:5173/hospital
- **Lab Dashboard:** http://localhost:5173/lab

### **Step 3: Trigger Outbreak**

**Via API:**
```bash
curl -X POST http://localhost:4000/api/simulate/dengue
```

**Via Browser:**
- Go to City Dashboard
- Click "Simulate Outbreak" button (if available)

### **Step 4: Watch Coordination**

**Backend Logs:**
```bash
tail -f /tmp/healsync-server.log
```

**You'll see:**
- ✅ Lab agents detect outbreak
- ✅ Hospital agents prepare wards
- ✅ Pharmacy agents check stock
- ✅ Supplier agents fulfill orders
- ✅ City agent coordinates response

**Frontend:**
- Watch real-time updates on dashboards
- See agent coordination timeline
- View resource allocation

---

## 🛠️ **Troubleshooting**

### **Issue: "Cannot connect to database"**

**Fix:**
```bash
# Check .env file
cat backend/.env
# Should have: MONGODB_URI=mongodb+srv://...

# Test connection
mongosh "YOUR_ATLAS_URI" --eval "db.stats()"
```

### **Issue: "Port already in use"**

**Backend (4000):**
```bash
cd backend && npm run kill-port && npm start
```

**ML Service (8000):**
```bash
lsof -ti:8000 | xargs kill -9
cd backend/ml_service && ./start-ml.sh
```

**Frontend (5173):**
```bash
lsof -ti:5173 | xargs kill -9
cd frontend && npm run dev
```

### **Issue: "Python not found"**

**Fix:**
```bash
cd backend/ml_service

# Create venv if doesn't exist
python3 -m venv .venv

# Activate and install
source .venv/bin/activate
pip install -r requirements.txt

# Run
python main.py
```

### **Issue: "Agents not initializing"**

**Check:**
```bash
# Verify entities in database
curl http://localhost:4000/api/entities | jq 'length'
# Should show: 23 or more

# If empty, reseed:
cd backend
node scripts/seedDatabase.js
```

---

## 📝 **Service Dependencies**

```
┌───────────────────────────────────────────┐
│  MongoDB Atlas (Required)                 │
│  - Must be running and accessible         │
│  - Connection string in backend/.env      │
└───────────────────────────────────────────┘
              ↓
┌───────────────────────────────────────────┐
│  Backend (Required)                       │
│  - Depends on MongoDB                     │
│  - Required for frontend to work          │
└───────────────────────────────────────────┘
              ↓
┌───────────────────────────────────────────┐
│  Frontend (Required for UI)               │
│  - Depends on Backend API                 │
│  - Shows dashboards and visualizations    │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│  ML Service (Optional)                    │
│  - Independent microservice               │
│  - Provides advanced predictions          │
│  - Backend works without it               │
└───────────────────────────────────────────┘
```

---

## 🎯 **Startup Scripts Summary**

| Service | Script | Location | Port |
|---------|--------|----------|------|
| Backend | `./start.sh` | `backend/` | 4000 |
| Backend (dev) | `npm run restart:dev` | `backend/` | 4000 |
| Frontend | `npm run dev` | `frontend/` | 5173 |
| ML Service | `./start-ml.sh` | `backend/ml_service/` | 8000 |

---

## ✅ **Current Status**

```bash
# Check all services
curl http://localhost:4000/health  # Backend
curl http://localhost:5173         # Frontend
curl http://localhost:8000/        # ML Service
```

**Expected:**
```
✅ Backend: {"status":"running","database":"connected"}
✅ Frontend: HTML response
✅ ML Service: {"service":"HealSync ML Service","status":"operational"}
```

---

## 🎉 **You're Ready!**

**All services are now running:**
- ✅ Backend with 24 AI agents
- ✅ Frontend dashboards
- ✅ MongoDB Atlas connected
- ✅ ML Service operational

**Open your browser:**
- http://localhost:5173/city

**Trigger an outbreak and watch the magic happen!** 🚀

---

## 📚 **Quick Reference**

### **Start Everything:**
```bash
# Terminal 1
cd backend && npm run restart:dev

# Terminal 2
cd frontend && npm run dev

# Terminal 3 (optional)
cd backend/ml_service && ./start-ml.sh
```

### **Stop Everything:**
```bash
# Kill all services
lsof -ti:4000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # ML Service
```

### **Check What's Running:**
```bash
lsof -i :4000  # Backend
lsof -i :5173  # Frontend
lsof -i :8000  # ML Service
```

---

**Your complete multi-agent healthcare coordination system is now live!** 🎊

