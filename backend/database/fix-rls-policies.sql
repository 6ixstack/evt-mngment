-- ================================
-- FIX RLS POLICIES FOR TRIGGER
-- The trigger needs proper permissions to insert
-- ================================

-- Drop existing policies that are blocking the trigger
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create proper RLS policies that work with triggers
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id);

-- This is the key fix - allow INSERT with proper condition
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Allow trigger function to bypass RLS by granting service_role permissions
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions to service role (used by triggers)
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.providers TO service_role;

-- Also ensure the trigger function has proper permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Test the fixed setup
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    current_role TEXT;
BEGIN
    -- Check current role
    SELECT current_user INTO current_role;
    RAISE NOTICE 'Current role: %', current_role;
    
    -- Test if we can insert as service_role
    SET LOCAL ROLE service_role;
    
    INSERT INTO public.users (id, name, email, type)
    VALUES (test_id, 'Test User', 'test@example.com', 'user');
    
    RAISE NOTICE '✅ Service role can insert users';
    
    -- Clean up
    DELETE FROM public.users WHERE id = test_id;
    
    -- Reset role
    RESET ROLE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '❌ Service role insert failed: % %', SQLSTATE, SQLERRM;
        RESET ROLE;
END $$;

-- Verification
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;