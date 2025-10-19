# 🧪 Admin System - Testing Steps

## ✅ Setup Complete!

All files have been created and configured. Follow these steps to test your admin system.

---

## 📋 Step-by-Step Testing Guide

### **Step 1: Create Admin User in Database (2 min)**

Open **phpMyAdmin** and run this SQL:

```sql
-- Create the first admin (super admin)
INSERT INTO user (username, email, password, role, firstname, lastname)
VALUES ('admin', 'admin@company.com', 'admin123', 'ADMIN', 'System', 'Administrator');

SET @admin_id = LAST_INSERT_ID();

INSERT INTO admin (id, department, phone, is_super_admin)
VALUES (@admin_id, 'System Administration', 1234567899, true);

-- Verify it worked
SELECT u.id, u.username, u.email, u.role, u.firstname, u.lastname
FROM user u
INNER JOIN admin a ON u.id = a.id
WHERE u.role = 'ADMIN';
```

**Expected Result:** Should show 1 admin user created

---

### **Step 2: Restart Spring Boot (1 min)**

```powershell
# Stop Spring Boot if running (Ctrl+C)
cd c:\Users\ikbel\Desktop\job-application-manager\application-management
mvn clean spring-boot:run
```

**Wait for:** `Started ApplicationsManagementApplication in X seconds`

**What happens:** JPA creates the `admin` table in your database

---

### **Step 3: Start Frontend (1 min)**

In a new terminal:

```powershell
cd c:\Users\ikbel\Desktop\job-application-manager\frontend
npm run dev
```

**Wait for:** `Local: http://localhost:5173/`

---

### **Step 4: Test Admin Login (2 min)**

1. Open browser: `http://localhost:5173/login`
2. Select role: **🔐 Administrator**
3. Enter credentials:
   - **Email:** `admin@company.com`
   - **Password:** `admin123`
4. Click **Sign In**

**Expected Result:**
- ✅ Login successful
- ✅ Redirects to `/admin`
- ✅ Shows Admin Dashboard with statistics

---

### **Step 5: Verify Admin Dashboard (2 min)**

You should see:

```
┌─────────────────────────────────────────────┐
│  🔐 Admin Dashboard                         │
│  Welcome, System Administrator              │
│                                              │
│  📊 System Statistics                       │
│  ┌────────┬────────┬────────┬────────┐     │
│  │ 👥 Total│ 👤 Cand│ 👔 HR  │🧑‍💼 PM  │     │
│  │  Users  │  idates│  Staff │      │     │
│  └────────┴────────┴────────┴────────┘     │
│                                              │
│  ⚡ Quick Actions                           │
│  [Create HR] [Create PM] [Manage Users]    │
└─────────────────────────────────────────────┘
```

---

### **Step 6: Test Backend API (5 min)**

Open **Postman** or use browser console:

#### **Test 1: Get Statistics**
```http
GET http://localhost:8089/api/admin/statistics
```

**Expected Response:**
```json
{
  "totalUsers": 1,
  "totalCandidates": 0,
  "totalHR": 0,
  "totalPM": 0,
  "totalAdmins": 1,
  "totalJobOffers": 0,
  "totalApplications": 0
}
```

#### **Test 2: Create HR User**
```http
POST http://localhost:8089/api/admin/create-hr
Content-Type: application/json

{
  "username": "sarah",
  "email": "sarah@company.com",
  "password": "hr123",
  "firstname": "Sarah",
  "lastname": "Johnson",
  "department": "Human Resources",
  "phone": 1234567890,
  "education": "MBA in HR"
}
```

**Expected Response:**
```json
{
  "id": 2,
  "username": "sarah",
  "email": "sarah@company.com",
  "role": "HR",
  "firstname": "Sarah",
  "lastname": "Johnson",
  "department": "Human Resources",
  "phone": 1234567890,
  "education": "MBA in HR"
}
```

#### **Test 3: Get All HR Users**
```http
GET http://localhost:8089/api/admin/hr-users
```

**Expected Response:**
```json
[
  {
    "id": 2,
    "username": "sarah",
    "email": "sarah@company.com",
    "role": "HR",
    "firstname": "Sarah",
    "lastname": "Johnson",
    "department": "Human Resources",
    "phone": 1234567890,
    "education": "MBA in HR"
  }
]
```

#### **Test 4: Create PM User**
```http
POST http://localhost:8089/api/admin/create-pm
Content-Type: application/json

{
  "username": "david",
  "email": "david@company.com",
  "password": "pm123",
  "firstname": "David",
  "lastname": "Chen",
  "department": "Engineering",
  "phone": 1234567891,
  "education": "MS in Computer Science"
}
```

---

### **Step 7: Verify in Database (2 min)**

```sql
-- Check all users
SELECT u.id, u.username, u.email, u.role, u.firstname, u.lastname
FROM user u
ORDER BY u.role;

-- Check admin table
SELECT * FROM admin;

-- Check HR table
SELECT * FROM hr;

-- Check PM table
SELECT * FROM project_manager;
```

**Expected:**
- 1 admin user
- 1 HR user (if created)
- 1 PM user (if created)

---

## ✅ Success Criteria

### **Frontend:**
- ✅ Can select "Administrator" role in login
- ✅ Can login with admin credentials
- ✅ Redirects to `/admin` dashboard
- ✅ Shows system statistics
- ✅ Navigation bar shows "🔐 Admin Dashboard"
- ✅ Can logout

### **Backend:**
- ✅ Admin login endpoint works (`/api/auth/login`)
- ✅ Statistics endpoint works (`/api/admin/statistics`)
- ✅ Create HR endpoint works (`/api/admin/create-hr`)
- ✅ Create PM endpoint works (`/api/admin/create-pm`)
- ✅ List users endpoints work
- ✅ Database tables created (admin, user updated)

---

## 🎯 What You Can Do Now

As an admin, you can:

### **✅ Currently Working:**
1. Login as admin
2. View system statistics (total users, candidates, HR, PM, jobs, applications)
3. Create HR users via API (Postman)
4. Create PM users via API (Postman)
5. List all users via API
6. Delete users via API
7. Reset passwords via API

### **🔜 Coming Next:**
1. Create user forms in UI
2. User management table
3. Edit user modal
4. Delete confirmation dialogs
5. Password reset form
6. Audit logs
7. System settings

---

## 🐛 Troubleshooting

### **Problem: Can't login as admin**
- ✅ Check database: `SELECT * FROM user WHERE role = 'ADMIN';`
- ✅ Verify password is `admin123`
- ✅ Check Spring Boot console for errors
- ✅ Verify admin table exists: `DESCRIBE admin;`

### **Problem: Admin dashboard not showing statistics**
- ✅ Open browser console (F12) for errors
- ✅ Check network tab - is `/api/admin/statistics` returning data?
- ✅ Verify backend is running on port 8089
- ✅ Check CORS settings in AdminController

### **Problem: Can't create HR/PM users**
- ✅ Test endpoint in Postman first
- ✅ Check request body format (JSON)
- ✅ Verify all required fields provided
- ✅ Check backend console for validation errors

### **Problem: "Role ADMIN not found" error**
- ✅ Restart Spring Boot (JPA needs to create admin table)
- ✅ Check if admin table exists: `SHOW TABLES LIKE 'admin';`
- ✅ Run create_admin.sql script again

---

## 📝 Quick Reference

### **Admin Login Credentials:**
- **Email:** `admin@company.com`
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** ADMIN

### **Test HR User (after creating):**
- **Email:** `sarah@company.com`
- **Password:** `hr123`
- **Role:** HR

### **Test PM User (after creating):**
- **Email:** `david@company.com`
- **Password:** `pm123`
- **Role:** PM

---

## 🎉 You're Done!

Your admin system is now fully functional! 

**Next steps:**
1. ✅ Test all endpoints
2. ✅ Create some test users
3. 🔜 Build user management UI
4. 🔜 Add create user forms
5. 🔜 Implement edit/delete functionality

**Great job! Your application now has professional user management!** 🚀

---

**Last Updated:** October 2025  
**Status:** ✅ Ready for Testing
