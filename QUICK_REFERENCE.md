# 🚀 HealSync Quick Reference Card

## 🎯 Complete Registration & Dashboard Flow for All 5 Agents

---

## 📋 Agent Types & Routes

| Agent Type | Registration | Dashboard Route | Emoji |
|------------|--------------|-----------------|-------|
| **Hospital** | ✅ | `/hospital-dashboard` | 🏥 |
| **Lab** | ✅ | `/lab-dashboard` | 🔬 |
| **Pharmacy** | ✅ | `/pharmacy-dashboard` | 💊 |
| **Supplier** | ✅ | `/supplier-dashboard` | 📦 |
| **City Admin** | ✅ | `/city-dashboard` | 🏙️ |

---

## 🔧 Quick Start

### **Register New Entity:**
```
1. Visit: http://localhost:3000
2. Click: "Register New Entity"
3. Select: Agent Type
4. Fill: Form (use UNIQUE emails!)
5. Submit: Click "Complete Registration"
6. ✅ Auto-logged in & redirected to dashboard
```

### **Demo Mode (Legacy):**
```
1. Visit: http://localhost:3000
2. Click: "Professional Login"
3. Select: Role + Entity
4. Click: "Enter Dashboard"
5. ✅ Redirected to dashboard
```

---

## ⚡ Key Features

### **All Dashboards Include:**
- ✅ Real-time metrics display
- ✅ Activity feed (recent events)
- ✅ Time-series graphs (trends)
- ✅ Entity information (contact, address)
- ✅ Auto-refresh every 5 seconds
- ✅ Role-specific UI design
- ✅ Logout functionality

---

## 🔑 Important Notes

### **Email Requirements:**
```
❌ WRONG:
Entity Email: "admin@example.com"
Admin Email: "admin@example.com"  ← DUPLICATE!

✅ CORRECT:
Entity Email: "hospital@example.com"    ← Unique
Admin Email: "admin.hospital@example.com"  ← Unique
```

### **If Registration Fails:**
1. **Check error message** - it tells you exactly what's wrong
2. **Use different email** if "already exists" error
3. **Fill all required fields** if validation error
4. **Check backend is running** if 500 error

---

## 🧪 Testing

### **Quick Test:**
```bash
# Register a test entity
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "entityData": {
      "entityType": "hospital",
      "name": "Test Hospital",
      "email": "test123@example.com",
      "phone": "+1234567890",
      "zone": "Zone-1",
      "address": "123 Test St",
      "coordinates": {"lat": 19, "lng": 72},
      "profile": {},
      "currentState": {}
    },
    "userData": {
      "email": "admin123@example.com",
      "password": "test123",
      "name": "Test Admin"
    }
  }'
```

### **Automated Test:**
```bash
./TEST_REGISTRATION.sh
```

---

## 📊 Dashboard Metrics

| Agent | Key Metrics |
|-------|-------------|
| 🏥 **Hospital** | Bed Occupancy, Available Beds, ICU Status |
| 🔬 **Lab** | Tests Today, Positive Rate, Disease Breakdown |
| 💊 **Pharmacy** | Total Stock, Low Stock Alerts, Medicine Inventory |
| 📦 **Supplier** | Total Inventory, Active Orders, Low Stock Items |
| 🏙️ **City** | Zone Health, Active Alerts, System Overview |

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| **500 Error** | Check backend logs, ensure MongoDB is running |
| **Duplicate Email** | Use a different email address |
| **Dashboard Not Loading** | Check entity ID is correct, check API response |
| **No Activity Feed** | Only works for new registrations (MongoDB IDs) |
| **Backend Not Running** | `cd backend && npm run dev` |
| **Frontend Not Running** | `cd frontend && npm run dev` |

---

## 📁 File Locations

### **Frontend:**
```
src/pages/
  ├── UnifiedHospitalDashboard.jsx
  ├── UnifiedLabDashboard.jsx
  ├── UnifiedPharmacyDashboard.jsx
  ├── UnifiedSupplierDashboard.jsx
  └── UnifiedCityDashboard.jsx

src/components/registration/
  ├── HospitalForm.jsx
  ├── LabForm.jsx
  ├── PharmacyForm.jsx
  ├── SupplierForm.jsx
  └── CityAdminForm.jsx
```

### **Backend:**
```
routes/
  ├── authRoutes.js (registration/login)
  ├── entityRoutes.js (entity CRUD)
  └── activityRoutes.js (activity logs)

models/
  ├── Entity.js (unified entity schema)
  └── User.js (user authentication)
```

---

## ✅ System Status Checklist

```
✅ All 5 registration forms working
✅ All 5 dashboards displaying data
✅ Error handling comprehensive
✅ Authentication flow complete
✅ Real-time updates working
✅ Activity feeds functional
✅ Backwards compatibility maintained
✅ Documentation complete
✅ Testing automated
```

---

## 🎉 Ready to Go!

**Everything is set up and working!**

**Just:**
1. 🔄 Refresh your browser
2. 📝 Register with a UNIQUE email
3. 🎊 Enjoy your personalized dashboard!

---

**Need Help?** 
- Check `REGISTRATION_FLOW_COMPLETE.md` for detailed documentation
- Check `SYSTEM_COMPLETE_SUMMARY.md` for technical details
- Run `./TEST_REGISTRATION.sh` to verify system health

