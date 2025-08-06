-- ================================
-- DELETE TEST USER SCRIPT
-- Reusable script to clean up any test user for fresh signup testing
-- ================================

-- INSTRUCTIONS:
-- 1. Change the email address below to the user you want to delete
-- 2. Run this script in Supabase SQL Editor
-- 3. Ready for fresh signup test!

-- ⚠️  CHANGE THIS EMAIL TO THE USER YOU WANT TO DELETE ⚠️
-- Replace 'mohaimenkhan46290@gmail.com' with your test email
DO $$
DECLARE
    test_email TEXT := 'mohaimenkhan46290@gmail.com'; -- 👈 CHANGE THIS EMAIL
    user_uuid UUID;
    deleted_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🧹 Starting cleanup for email: %', test_email;
    
    -- Get the user UUID from auth table
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = test_email;
    
    IF user_uuid IS NOT NULL THEN
        RAISE NOTICE 'Found user with ID: %', user_uuid;
        
        -- Delete from providers table first (foreign key dependency)
        DELETE FROM public.providers WHERE user_id = user_uuid;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '✅ Deleted % provider records', deleted_count;
        
        -- Delete from events table
        DELETE FROM public.events WHERE user_id = user_uuid;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '✅ Deleted % event records', deleted_count;
        
        -- Delete from leads table  
        DELETE FROM public.leads WHERE user_id = user_uuid;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '✅ Deleted % lead records', deleted_count;
        
        -- Delete from users table
        DELETE FROM public.users WHERE id = user_uuid;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '✅ Deleted % user records', deleted_count;
        
        -- Delete from auth identities
        DELETE FROM auth.identities WHERE user_id = user_uuid;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '✅ Deleted % auth identity records', deleted_count;
        
        -- Delete from auth users (this is the main one)
        DELETE FROM auth.users WHERE id = user_uuid;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '✅ Deleted % auth user records', deleted_count;
        
    ELSE
        RAISE NOTICE '⚠️  No user found with email: %', test_email;
    END IF;
    
    -- Verification
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = test_email) THEN
        RAISE WARNING '❌ User still exists in auth.users!';
    ELSE
        RAISE NOTICE '✅ User completely removed from auth.users';
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.users WHERE email = test_email) THEN
        RAISE WARNING '❌ User still exists in public.users!';
    ELSE
        RAISE NOTICE '✅ User completely removed from public.users';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CLEANUP COMPLETE!';
    RAISE NOTICE '================================';
    RAISE NOTICE 'Email % has been completely removed', test_email;
    RAISE NOTICE 'Ready for fresh signup test!';
    RAISE NOTICE '================================';
    
END $$;