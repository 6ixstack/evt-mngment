-- ================================
-- EVENTCRAFT SIGNUP DEBUG SCRIPT
-- Find and fix the exact issue
-- ================================

-- Check trigger exists and is active
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_condition
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check function exists
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check tables exist and structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users';

-- Check if we can insert directly (test permissions)
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    -- Try direct insert
    INSERT INTO public.users (id, name, email, type)
    VALUES (test_id, 'Test User', 'test@example.com', 'user');
    
    RAISE NOTICE '✅ Direct insert works';
    
    -- Clean up test record
    DELETE FROM public.users WHERE id = test_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '❌ Direct insert failed: % %', SQLSTATE, SQLERRM;
END $$;

-- Test the trigger function directly
DO $$
DECLARE
    test_record RECORD;
BEGIN
    -- Create a mock auth.users record structure
    SELECT 
        gen_random_uuid() as id,
        'test@example.com' as email,
        '{"user_type": "provider", "full_name": "Test Provider"}'::jsonb as raw_user_meta_data
    INTO test_record;
    
    -- Try calling the function directly
    PERFORM public.handle_new_user();
    
    RAISE NOTICE '✅ Trigger function can be called';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '❌ Trigger function failed: % %', SQLSTATE, SQLERRM;
END $$;