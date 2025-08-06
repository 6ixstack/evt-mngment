-- ================================
-- TEST FRONTEND INSERT CAPABILITY
-- Simulates what the frontend signup should do
-- ================================

-- Test if we can insert as anon role (what frontend uses during signup)
DO $$
DECLARE
    test_id UUID := 'd9f1a1d9-9aa9-417a-be1a-c044da070ed8'; -- Use the actual user ID from logs
BEGIN
    RAISE NOTICE '🧪 Testing frontend user creation...';
    
    -- Test 1: Try as anon role (signup scenario)
    SET LOCAL ROLE anon;
    
    INSERT INTO public.users (id, name, email, type)
    VALUES (test_id, 'Mohaimen Khan', 'mohaimenkhan46290@gmail.com', 'provider');
    
    RAISE NOTICE '✅ SUCCESS: Anon role can insert users';
    
    -- Reset role for cleanup
    RESET ROLE;
    
    -- Verify the record exists
    IF EXISTS (SELECT 1 FROM public.users WHERE id = test_id) THEN
        RAISE NOTICE '✅ SUCCESS: User record created and exists';
        
        -- Now create provider record
        INSERT INTO public.providers (
            user_id, business_name, provider_type, phone, 
            location_city, location_province, description, tags
        ) VALUES (
            test_id, 'Mohaimen Khan Services', 'other', '+1-000-000-0000',
            'Toronto', 'Ontario', 'Professional event services', ARRAY['professional']
        );
        
        RAISE NOTICE '✅ SUCCESS: Provider record created';
    ELSE
        RAISE WARNING '❌ FAILED: User record was not created';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RESET ROLE;
        RAISE WARNING '❌ FAILED: Cannot insert as anon role: % %', SQLSTATE, SQLERRM;
        
        -- Try to diagnose the issue
        RAISE NOTICE '🔍 Checking permissions...';
        
        -- Check if table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
            RAISE NOTICE '✅ Table exists';
        ELSE
            RAISE WARNING '❌ Table does not exist';
        END IF;
        
        -- Check permissions
        IF EXISTS (
            SELECT 1 FROM information_schema.role_table_grants 
            WHERE table_name = 'users' AND grantee = 'anon' AND privilege_type = 'INSERT'
        ) THEN
            RAISE NOTICE '✅ Anon has INSERT permission';
        ELSE
            RAISE WARNING '❌ Anon missing INSERT permission';
        END IF;
END $$;