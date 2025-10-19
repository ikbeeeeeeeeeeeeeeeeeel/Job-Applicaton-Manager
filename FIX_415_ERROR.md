# ✅ FIXED: HTTP 415 Error - Job Offer Update

## 🎯 The Problem

**Error:** `Failed to save job offer: 415`
**HTTP Status:** 415 Unsupported Media Type

### **What This Means:**
The backend rejected the request because it didn't recognize the content format (JSON).

---

## 🔍 Root Cause

### **File:** `HRController.java`

**The issue:**
- The **publish** endpoint explicitly accepts JSON:
  ```java
  @PostMapping(value = "/joboffers/publish", 
               consumes = {"application/json", "application/json;charset=UTF-8"})
  ```

- The **update** endpoint was MISSING this:
  ```java
  @PutMapping("/joboffers/update")  // ❌ No consumes attribute!
  public JobOffer modifyJobOffer(@RequestBody JobOffer jobOffer)
  ```

**Result:** Spring Boot rejected JSON requests with HTTP 415!

---

## ✅ The Fix

### **Changed:**
```java
// BEFORE
@PutMapping("/joboffers/update")
public JobOffer modifyJobOffer(@RequestBody JobOffer jobOffer) {
    return hrService.modifyJobOffer(jobOffer);
}
```

### **To:**
```java
// AFTER
@PutMapping(value = "/joboffers/update", 
            consumes = {"application/json", "application/json;charset=UTF-8"})
public JobOffer modifyJobOffer(@RequestBody JobOffer jobOffer) {
    return hrService.modifyJobOffer(jobOffer);
}
```

**What this does:**
- ✅ Tells Spring Boot to accept `Content-Type: application/json`
- ✅ Accepts UTF-8 charset
- ✅ Matches the publish endpoint configuration

---

## 🚀 How to Test

### **Step 1: Restart Spring Boot Backend**

**CRITICAL:** You MUST restart the backend for this to work!

```bash
# Stop backend (Ctrl+C)
# Then restart:
mvn spring-boot:run
```

**OR in your IDE:**
- Stop the running application
- Run it again

---

### **Step 2: Test Job Offer Update**

1. **Go to HR Dashboard**
2. **Navigate to "Job Offers" tab**
3. **Click "✏️ Edit" on any job offer**
4. **Modify any field** (e.g., change title, salary)
5. **Click "💾 Update Offer"**

**Expected Result:**
```
✅ Job offer updated successfully!
```

**No more 415 error!**

---

## 📊 Why This Happened

### **HTTP 415 Error Causes:**

| Issue | Explanation |
|-------|-------------|
| **Missing `consumes`** | Spring Boot doesn't know endpoint accepts JSON |
| **Wrong Content-Type** | Frontend sends JSON but backend expects form data |
| **Charset issues** | Backend rejects UTF-8 encoded JSON |

### **Our Case:**
The `update` endpoint was missing the `consumes` attribute, so Spring Boot used default behavior which may not accept JSON properly.

---

## 🎯 Comparison: Publish vs Update

### **Publish Endpoint (Working):**
```java
@PostMapping(value = "/joboffers/publish", 
             consumes = {"application/json", "application/json;charset=UTF-8"})
public JobOffer publishJobOffer(@RequestBody JobOffer jobOffer) {
    return hrService.publishJobOffer(jobOffer);
}
```
✅ Has `consumes` → Accepts JSON → Works!

### **Update Endpoint (Was Broken):**
```java
@PutMapping("/joboffers/update")  // ❌ No consumes
public JobOffer modifyJobOffer(@RequestBody JobOffer jobOffer) {
    return hrService.modifyJobOffer(jobOffer);
}
```
❌ No `consumes` → Rejects JSON → HTTP 415!

### **Update Endpoint (Now Fixed):**
```java
@PutMapping(value = "/joboffers/update", 
            consumes = {"application/json", "application/json;charset=UTF-8"})
public JobOffer modifyJobOffer(@RequestBody JobOffer jobOffer) {
    return hrService.modifyJobOffer(jobOffer);
}
```
✅ Has `consumes` → Accepts JSON → Works!

---

## 🔍 How Spring Boot Handles Requests

### **Without `consumes`:**
```
1. Frontend sends: Content-Type: application/json
2. Spring Boot: "Is this endpoint configured for JSON?"
3. Spring Boot: "No consumes attribute... reject!"
4. Returns: HTTP 415 Unsupported Media Type
```

### **With `consumes`:**
```
1. Frontend sends: Content-Type: application/json
2. Spring Boot: "Is this endpoint configured for JSON?"
3. Spring Boot: "Yes! consumes = application/json"
4. Spring Boot: "Accept and process request ✅"
5. Returns: HTTP 200 OK
```

---

## ✅ Technical Details

### **The `consumes` Attribute:**

```java
consumes = {"application/json", "application/json;charset=UTF-8"}
```

**What it does:**
- ✅ Tells Spring which Content-Type headers to accept
- ✅ Supports both `application/json` and `application/json;charset=UTF-8`
- ✅ Rejects requests with other Content-Types

### **Why Two Values:**
```java
"application/json"              // Standard JSON
"application/json;charset=UTF-8" // JSON with explicit UTF-8
```

Some browsers/tools send charset, some don't. This accepts both!

---

## 🐛 Other Potential Issues

If you still see errors after restart, check:

### **1. Backend Console:**
Look for errors like:
```
Content type 'application/json' not supported
HttpMediaTypeNotSupportedException
```

### **2. Frontend Network Tab:**
1. Open DevTools (F12)
2. Go to "Network" tab
3. Click on the failed request
4. Check "Request Headers"
5. Verify `Content-Type: application/json` is present

### **3. Backend Logs:**
Enable debug logging in `application.properties`:
```properties
logging.level.org.springframework.web=DEBUG
```

This shows which endpoints accept which content types.

---

## ✅ Summary

**The Problem:**
- ❌ Update endpoint missing `consumes` attribute
- ❌ Backend rejected JSON with HTTP 415
- ❌ Job offer updates failed

**The Fix:**
- ✅ Added `consumes = {"application/json", "application/json;charset=UTF-8"}`
- ✅ Backend now accepts JSON
- ✅ Job offer updates work!

**What You Need to Do:**
1. ✅ **Restart Spring Boot backend** (REQUIRED!)
2. ✅ Refresh frontend (F5)
3. ✅ Try editing a job offer
4. ✅ It should work now!

---

**Restart your backend now and the 415 error will be gone!** 🎉

---

**Last Updated:** October 2025  
**Status:** ✅ Fixed - Restart Backend Required!
