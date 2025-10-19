-- =====================================================
-- Create Admin User
-- Run this script ONCE to create the first admin
-- =====================================================

-- Create the first admin (super admin)
INSERT INTO user (username, email, password, role, firstname, lastname)
VALUES ('admin', 'admin@company.com', 'admin123', 'ADMIN', 'System', 'Administrator');

SET @admin_id = LAST_INSERT_ID();

INSERT INTO admin (id, department, phone, is_super_admin)
VALUES (@admin_id, 'System Administration', 1234567899, true);

-- =====================================================
-- Verify Admin Created
-- =====================================================

SELECT '====== Admin User Created ======' as '';
SELECT u.id, u.username, u.email, u.role, u.firstname, u.lastname,
       a.department, a.phone, a.is_super_admin
FROM user u
INNER JOIN admin a ON u.id = a.id
WHERE u.role = 'ADMIN';

-- =====================================================
-- Login Credentials:
-- Email: admin@company.com
-- Username: admin
-- Password: admin123
-- Role: ADMIN
-- =====================================================

-- ⚠️ IMPORTANT SECURITY NOTES:
-- 1. Change the password immediately after first login
-- 2. In production, use BCrypt hashed passwords
-- 3. Store passwords securely
-- 4. Implement password reset functionality
-- 5. Use strong passwords (min 12 characters, mixed case, numbers, symbols)

-- =====================================================
-- Create Additional Admins (Optional)
-- =====================================================

-- Example: Create a regular admin (not super admin)
/*
INSERT INTO user (username, email, password, role, firstname, lastname)
VALUES ('john.admin', 'john@company.com', 'secure123', 'ADMIN', 'John', 'Smith');

SET @admin_id = LAST_INSERT_ID();

INSERT INTO admin (id, department, phone, is_super_admin)
VALUES (@admin_id, 'Human Resources', 1234567898, false);
*/

-- =====================================================
-- RECOMMENDED: Update Comment in code
-- After running this script:
-- 1. Restart Spring Boot application
-- 2. Login at http://localhost:5173/login
-- 3. Select "ADMIN" as role
-- 4. Use credentials above
-- 5. Change password through admin panel
-- =====================================================
