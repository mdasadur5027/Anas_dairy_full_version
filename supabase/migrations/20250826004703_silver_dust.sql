/*
  # Create Admin User

  This migration creates a default admin user for the system.
  
  1. Admin User Details
    - Email: admin@ruetmilk.com
    - Password: admin123 (should be changed after first login)
    - Role: admin
    - Name: System Administrator
    
  2. Security
    - Admin user will be created with proper authentication
    - Password should be changed immediately after first login
*/

-- Insert admin user (this will be handled through Supabase Auth UI or manual creation)
-- The admin user needs to be created through Supabase dashboard or auth signup
-- Then update their role to admin in the users table

-- This is a placeholder migration - actual admin user creation should be done through:
-- 1. Supabase Auth Dashboard
-- 2. Or programmatically through the signup process
-- 3. Then manually update the role in the database

-- Example of updating a user's role to admin (replace 'user-uuid' with actual UUID):
-- UPDATE users SET role = 'admin' WHERE email = 'admin@ruetmilk.com';

-- For demo purposes, you can create an admin user by:
-- 1. Signing up normally through the client auth
-- 2. Then running this query to make them admin:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';