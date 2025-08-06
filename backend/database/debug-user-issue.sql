-- ================================
-- DEBUG USER PROFILE ISSUE
-- Check what's happening with user creation
-- ================================

-- 1. Check users table
SELECT 'Users table contents:' as info;
SELECT id, email, name, type, created_at FROM users ORDER BY created_at DESC;

-- 2. Check auth.users table  
SELECT 'Auth users table:' as info;
SELECT id, email, created_at, raw_user_meta_data FROM auth.users ORDER BY created_at DESC LIMIT 3;

-- 3. Check if the specific user exists in auth but not in users
-- Replace this UUID with the one from your error: da63a90c-2689-4398-a7db-475bc599af59
SELECT 'Checking specific user:' as info;
SELECT 
    'In auth.users:' as location,
    COUNT(*) as count 
FROM auth.users 
WHERE id = 'da63a90c-2689-4398-a7db-475bc599af59'
UNION ALL
SELECT 
    'In public.users:' as location,
    COUNT(*) as count 
FROM users 
WHERE id = 'da63a90c-2689-4398-a7db-475bc599af59';

-- 4. Check RLS policies
SELECT 'Current RLS policies:' as info;
SELECT pol.polname, pol.polcmd 
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'users';

-- 5. Test if we can manually insert that user
SELECT 'Testing manual user creation:' as info;
-- This will show if there are any permission issues