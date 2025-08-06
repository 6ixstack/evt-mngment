-- ================================
-- FIX 406 NOT ACCEPTABLE ERROR
-- This error happens when RLS blocks the request
-- ================================

-- Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Check current policies
SELECT pol.polname, pol.polcmd, pol.polroles 
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'users';

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert during signup" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view profiles" ON users;
DROP POLICY IF EXISTS "Anyone can insert profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create new, more permissive policies
-- IMPORTANT: Very permissive for development
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Make sure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grant permissions to ensure access
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- Test the policies
SELECT 'Testing SELECT permission...' as test;
SELECT COUNT(*) FROM users;

-- Verify the fix
SELECT 
    'RLS Enabled' as status,
    rowsecurity as enabled,
    'Policies Count' as metric,
    COUNT(pol.polname) as count
FROM pg_tables 
LEFT JOIN pg_policy pol ON pol.polrelid = (tablename::regclass)
WHERE schemaname = 'public' AND tablename = 'users'
GROUP BY rowsecurity;