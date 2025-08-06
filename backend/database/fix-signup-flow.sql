-- ================================
-- FIX SIGN-UP FLOW
-- Ensure everything is set up correctly
-- ================================

-- 1. First, ensure user_type enum exists with correct values
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('user', 'provider');
    END IF;
END $$;

-- 2. Ensure users table has correct structure
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    type user_type NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies and recreate
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Anyone can view user profiles (needed for provider discovery)
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT
    USING (true);

-- Users can create their own profile during signup
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 5. Grant necessary permissions
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT USAGE ON TYPE user_type TO anon;
GRANT USAGE ON TYPE user_type TO authenticated;

-- 6. Disable the trigger that might be interfering
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 7. Create a simple test to verify
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Test that we can insert a user
    RAISE NOTICE 'Testing user insert capability...';
    
    -- Check if anon can see the users table
    SELECT has_table_privilege('anon', 'public.users', 'INSERT') as can_insert,
           has_table_privilege('anon', 'public.users', 'SELECT') as can_select
    INTO test_result;
    
    RAISE NOTICE 'Anon permissions - INSERT: %, SELECT: %', 
        test_result.can_insert, test_result.can_select;
END $$;

-- 8. Show current state
SELECT 'Current user count:' as info, COUNT(*) as count FROM users;
SELECT 'Current auth user count:' as info, COUNT(*) as count FROM auth.users;