-- ================================
-- DEBUG AUTH ERROR
-- Run this to diagnose the issue
-- ================================

-- 1. Check if user_type enum exists
SELECT 'Checking user_type enum...' as step;
SELECT typname, enumlabel 
FROM pg_type 
JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid 
WHERE typname = 'user_type';

-- 2. Check if users table exists
SELECT 'Checking users table...' as step;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 3. Check if trigger exists
SELECT 'Checking trigger...' as step;
SELECT tgname, tgtype 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 4. Check if functions exist
SELECT 'Checking functions...' as step;
SELECT proname 
FROM pg_proc 
WHERE proname IN ('handle_auth_user_created', 'create_user_profile');

-- 5. Check permissions on users table
SELECT 'Checking permissions...' as step;
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'users'
ORDER BY grantee, privilege_type;

-- 6. Test the trigger function manually
SELECT 'Testing trigger function...' as step;
-- This simulates what the trigger does
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'test@example.com';
    test_name TEXT := 'Test User';
BEGIN
    -- Try to insert directly
    INSERT INTO users (id, email, name, type)
    VALUES (test_id, test_email, test_name, 'user'::user_type);
    
    -- If successful, delete it
    DELETE FROM users WHERE id = test_id;
    
    RAISE NOTICE 'SUCCESS: Direct insert works!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
        RAISE NOTICE 'DETAIL: %', SQLSTATE;
END $$;

-- 7. Check if there are any errors in the trigger function
SELECT 'Checking trigger function definition...' as step;
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'handle_auth_user_created';

-- 8. Check RLS policies
SELECT 'Checking RLS status...' as step;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 9. Check if service_role can insert
SELECT 'Checking service_role permissions...' as step;
SELECT has_table_privilege('service_role', 'public.users', 'INSERT');

-- ================================
-- Common fixes:
-- 1. Make sure all types exist
-- 2. Ensure users table has correct structure
-- 3. Grant proper permissions
-- 4. Check trigger function syntax
-- ================================