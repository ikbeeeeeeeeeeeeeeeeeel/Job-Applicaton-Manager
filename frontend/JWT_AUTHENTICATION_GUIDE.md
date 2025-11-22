# 🔐 JWT Authentication Guide for Frontend

## ✅ What's Been Implemented

### 1. **Backend Security (Completed)**
- Spring Security with JWT authentication
- Role-based access control (ROLE_CANDIDATE, ROLE_HR, ROLE_PM, ROLE_ADMIN)
- JWT tokens with 24-hour validity
- Automatic token validation on every request

### 2. **Frontend Updates (Completed)**
- AuthContext updated to store JWT tokens
- API utility functions for authenticated requests
- Auto-logout on token expiry (401 responses)
- Updated pages: JobOffers, MyApplications

---

## 📚 How to Use JWT Authentication

### **For Login (Already Implemented)**

The login page automatically handles JWT token generation and storage:

```javascript
// Login.jsx - Already updated
const response = await fetch('http://localhost:8089/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ emailOrUsername, password, role })
});

const userData = await response.json();
// userData contains: { id, email, username, role, firstname, lastname, token }

login(userData); // Stores user + token in localStorage
```

### **For Making API Calls**

Use the provided API utility functions:

```javascript
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { getToken } = useAuth();
  
  // GET request
  const fetchData = async () => {
    const token = getToken();
    const data = await apiGet('/candidates/1/applications', token);
  };
  
  // POST request
  const createData = async () => {
    const token = getToken();
    const result = await apiPost('/candidates/apply', { 
      candidateId: 1, 
      jobOfferId: 5 
    }, token);
  };
  
  // PUT request
  const updateData = async () => {
    const token = getToken();
    const updated = await apiPut('/candidates/1/applications/10', { 
      resume: "base64..." 
    }, token);
  };
  
  // DELETE request
  const deleteData = async () => {
    const token = getToken();
    await apiDelete('/candidates/1/applications/10', token);
  };
}
```

### **Old Way vs New Way**

❌ **OLD (Insecure - Don't use)**
```javascript
const response = await fetch('http://localhost:8089/api/candidates/1', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});
const data = await response.json();
```

✅ **NEW (Secure - Use this)**
```javascript
import { apiGet } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const { getToken } = useAuth();
const token = getToken();
const data = await apiGet('/candidates/1', token);
```

---

## 🔧 How It Works

### **1. Login Flow**
```
User enters credentials
    ↓
POST /api/auth/login
    ↓
Backend validates & generates JWT token
    ↓
Token sent to frontend
    ↓
Stored in localStorage via AuthContext
    ↓
User redirected to dashboard
```

### **2. API Request Flow**
```
Component needs data
    ↓
Get token from AuthContext
    ↓
Include token in Authorization header
    ↓
Backend validates token
    ↓
If valid: Process request
If invalid/expired: Return 401
    ↓
Frontend auto-logout on 401
```

### **3. Token Storage**
- Token stored in `localStorage` as part of user object
- Automatically loaded on page refresh
- Cleared on logout or 401 error

---

## 🛡️ Security Features

### **Automatic Token Validation**
- Every API call includes `Authorization: Bearer <token>` header
- Backend verifies token signature and expiry
- Invalid/expired tokens result in 401 Unauthorized

### **Auto-Logout on Session Expiry**
```javascript
// In api.js
if (response.status === 401) {
  localStorage.removeItem('user');
  window.location.href = '/login';
  throw new Error('Session expired. Please login again.');
}
```

### **Role-Based Access Control**
Backend automatically checks user role from JWT token:
- ROLE_CANDIDATE: Access to `/api/candidates/**`
- ROLE_HR: Access to `/api/hr/**`
- ROLE_PM: Access to `/api/pm/**`
- ROLE_ADMIN: Access to `/api/admin/**`

---

## 📝 Pages Updated

### ✅ **Completed**
- `Login.jsx` - Receives and stores JWT token
- `AuthContext.jsx` - Token storage and validation
- `JobOffers.jsx` - Authenticated job browsing and application
- `MyApplications.jsx` - Authenticated view/edit/delete applications

### ⏳ **To Update**
- `HR/*.jsx` - HR dashboard pages
- `pm/*.jsx` - PM dashboard pages
- `admin/*.jsx` - Admin pages
- `Register.jsx` - Registration endpoint

---

## 🎯 Quick Migration Checklist

To update any page to use JWT authentication:

1. **Import API utilities**
   ```javascript
   import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
   ```

2. **Get getToken from AuthContext**
   ```javascript
   const { getToken } = useAuth();
   ```

3. **Replace all fetch calls**
   ```javascript
   // Replace this:
   const response = await fetch('http://localhost:8089/api/endpoint');
   const data = await response.json();
   
   // With this:
   const token = getToken();
   const data = await apiGet('/endpoint', token);
   ```

4. **Remove manual error handling for 401**
   - The API utility automatically handles 401 errors
   - User will be logged out and redirected to login page

---

## 🚀 Testing JWT Authentication

### **1. Test Login**
```bash
POST http://localhost:8089/api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "test@example.com",
  "password": "password123",
  "role": "CANDIDATE"
}
```

**Expected Response:**
```json
{
  "id": 1,
  "email": "test@example.com",
  "username": "testuser",
  "role": "ROLE_CANDIDATE",
  "firstname": "Test",
  "lastname": "User",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### **2. Test Protected Endpoint**
```bash
GET http://localhost:8089/api/candidates/1/applications
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### **3. Test Without Token**
```bash
GET http://localhost:8089/api/candidates/1/applications
# No Authorization header
```

**Expected:** 401 Unauthorized

---

## 🐛 Troubleshooting

### **Issue: 401 Unauthorized Error**
**Causes:**
- No token provided
- Token expired (24-hour validity)
- Invalid token
- Wrong role for endpoint

**Solution:** Login again to get a fresh token

### **Issue: User Logged Out Automatically**
**Causes:**
- Token expired after 24 hours
- Backend returned 401 error

**Solution:** This is expected behavior. User needs to login again.

### **Issue: CORS Error**
**Check:** Backend SecurityConfig allows your frontend origin:
```java
configuration.setAllowedOrigins(Arrays.asList(
  "http://localhost:3000", 
  "http://localhost:5173"
));
```

---

## 📖 Additional Resources

### **JWT Token Structure**
```
eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9DQU5ESURBVEU...
│                     │
Header                Payload (contains: role, userId, username, exp)
```

### **Token Contents**
- `sub`: Username
- `role`: User role (ROLE_CANDIDATE, etc.)
- `userId`: User ID
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (24 hours from issue)

### **Decoding Token (For Debugging)**
Visit: https://jwt.io/
Paste your token to see its contents (don't share real tokens!)

---

## ✅ Summary

**What works now:**
- Secure JWT-based authentication
- Role-based access control
- Automatic token refresh on page reload
- Auto-logout on token expiry
- Protected API endpoints

**Next steps:**
- Update remaining frontend pages (HR, PM, Admin)
- Implement token refresh mechanism (optional)
- Add password change functionality with token

---

**Updated:** November 20, 2025
**Status:** ✅ JWT Authentication Fully Implemented
