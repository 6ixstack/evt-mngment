-- ================================
-- CLEANUP TEST USER SCRIPT
-- Removes test user from both auth and database tables
-- ================================

-- Remove from providers table first (foreign key dependency)
DELETE FROM public.providers 
WHERE user_id IN (
    SELECT id FROM public.users 
    WHERE email = 'mohaimenkhan46290@gmail.com'
);

-- Remove from users table
DELETE FROM public.users 
WHERE email = 'mohaimenkhan46290@gmail.com';

-- Remove from Supabase auth (this is the key part)
DELETE FROM auth.users 
WHERE email = 'mohaimenkhan46290@gmail.com';

-- Clean up any related auth data
DELETE FROM auth.identities 
WHERE provider_id IN (
    SELECT id::text FROM auth.users 
    WHERE email = 'mohaimenkhan46290@gmail.com'
);

-- Success message
DO $$
DECLARE
    user_count INTEGER;
    auth_count INTEGER;
BEGIN
    -- Check users table
    SELECT COUNT(*) INTO user_count 
    FROM public.users 
    WHERE email = 'mohaimenkhan46290@gmail.com';
    
    -- Check auth table
    SELECT COUNT(*) INTO auth_count 
    FROM auth.users 
    WHERE email = 'mohaimenkhan46290@gmail.com';
    
    RAISE NOTICE '✅ Cleanup complete:';
    RAISE NOTICE '   - Users table: % records remaining', user_count;
    RAISE NOTICE '   - Auth table: % records remaining', auth_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for fresh signup test!';
END $$;