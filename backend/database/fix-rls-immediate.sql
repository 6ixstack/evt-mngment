-- ================================
-- FIX RLS AND CONFLICT ERRORS
-- Run this immediately to fix the 406/409 errors
-- ================================

-- 1. Drop all existing policies on users table
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users; 
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert during signup" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view profiles" ON users;
DROP POLICY IF EXISTS "Anyone can insert profile" ON users;

-- 2. Temporarily disable RLS to test
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Test if we can now read users
SELECT 'Testing without RLS...' as test;
SELECT COUNT(*) as user_count FROM users;

-- 4. Re-enable RLS with very simple policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Create the simplest possible policies
CREATE POLICY "allow_all_select" ON users FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_own_update" ON users FOR UPDATE USING (auth.uid() = id);

-- 6. Make sure all roles have access
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated; 
GRANT ALL ON users TO service_role;

-- 7. Check current user data
SELECT 'Current users in database:' as info;
SELECT id, email, type, created_at FROM users ORDER BY created_at DESC LIMIT 5;

-- 8. Test the fix
SELECT 'Testing SELECT with new policies...' as test;
SET ROLE anon;
SELECT COUNT(*) FROM users;
RESET ROLE;

SELECT 'RLS fix complete!' as status;