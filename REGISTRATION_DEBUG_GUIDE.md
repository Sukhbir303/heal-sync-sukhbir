# 🔧 Registration 500 Error - Debug Guide

## ✅ **Fixes Applied:**

### **1. Added Console Logging ✅**

**RegistrationPage.jsx:**
- ✅ Logs data being submitted
- ✅ Logs response from server
- ✅ Shows detailed error messages

**PharmacyForm.jsx:**
- ✅ Logs form data before validation
- ✅ Shows if validation fails
- ✅ Logs data being sent to parent

### **2. Improved Error Display ✅**

- ✅ Shows backend error messages (not just "Registration failed")
- ✅ Added error display for admin name field
- ✅ Added error display for address field

---

## 🔍 **How to Debug:**

### **Step 1: Open Browser Console**
```
1. Open browser (Chrome/Firefox/Safari)
2. Press F12 or Right-click → Inspect
3. Go to "Console" tab
4. Keep it open while testing registration
```

### **Step 2: Try Registration Again**

Fill out the pharmacy form and click "Complete Registration"

### **Step 3: Check Console Logs**

You should see:
```
PharmacyForm: Validating form data: {name: "...", email: "...", ...}
PharmacyForm: Submitting data: {entityData: {...}, userData: {...}}
Submitting registration data: {entityData: {...}, userData: {...}}
Registration response: {success: true, ...}
```

### **Step 4: Check Network Tab (if console doesn't help)**

```
1. Go to "Network" tab in developer tools
2. Click "Complete Registration"
3. Find the request to "/api/auth/register"
4. Click on it
5. Check:
   - Request payload (what was sent)
   - Response (what server returned)
   - Status code (should be 200 for success, 500 for error)
```

---

## 🎯 **Common Issues & Solutions:**

### **Issue 1: Validation Failing**

**Console shows:** `PharmacyForm: Validation failed`

**Solution:**
- Check which fields are empty
- Make sure all required fields (*) are filled:
  - Pharmacy Name
  - Zone
  - Address
  - Phone
  - **Pharmacy Email** (must be filled!)
  - Admin Name
  - Admin Email  
  - Password (min 6 chars)
  - Confirm Password (must match)

### **Issue 2: Email Already Exists**

**Error:** `"Email already registered"`

**Solution:**
- Use a different email address
- Or delete the existing user from MongoDB

### **Issue 3: Backend Error**

**Status:** 500 Internal Server Error

**Check:**
1. Backend is running (http://localhost:4000/health)
2. MongoDB is connected
3. Backend logs for detailed error

---

## 🧪 **Test the API Directly:**

If frontend still fails, test backend directly:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "entityData": {
      "entityType": "pharmacy",
      "name": "CityCare Pharmacy",
      "email": "citycare@pharmacy.com",
      "phone": "8097952009",
      "zone": "Zone-1",
      "address": "Shop 12, Crescent Plaza, Mumbai",
      "coordinates": {"lat": 19.076, "lng": 72.877},
      "profile": {},
      "currentState": {
        "medicines": {
          "paracetamol": {"stock": 5000, "reorderLevel": 1000}
        }
      }
    },
    "userData": {
      "email": "rohan.deshmukh@example.com",
      "password": "password123",
      "name": "Rohan Deshmukh"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {...},
    "entity": {...}
  }
}
```

---

## 📊 **What to Share for Further Debug:**

If still not working, please share:

1. **Console Logs:**
   - All logs starting with "PharmacyForm:"
   - All logs starting with "Submitting registration"
   - Any error messages

2. **Network Tab:**
   - Request payload
   - Response body
   - Status code

3. **Backend Terminal:**
   - Any error messages
   - Stack trace if available

---

## ✅ **Quick Checklist:**

Before submitting:
- [ ] All fields filled (including new Pharmacy Email field)
- [ ] Password is at least 6 characters
- [ ] Passwords match
- [ ] Email is unique (not already registered)
- [ ] Backend is running (check http://localhost:4000/health)
- [ ] MongoDB is connected
- [ ] Browser console is open to see logs

---

## 🚀 **If Everything Looks Good:**

The registration should work now! The added logging will help identify exactly where any issue occurs.

**Remember:** The API test worked successfully, so the backend is fine. The issue is likely:
- A validation issue in the frontend
- An empty required field
- A duplicate email
- Or a network/CORS issue

The console logs will tell us exactly what's happening! 🔍

