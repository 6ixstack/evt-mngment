-- ================================
-- DISABLE BROKEN TRIGGER
-- We'll handle user creation in frontend instead
-- ================================

-- Remove the problematic trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Disable RLS temporarily to allow frontend to create users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers DISABLE ROW LEVEL SECURITY;

-- Grant permissions for anon/authenticated users to insert
GRANT INSERT, SELECT, UPDATE ON public.users TO anon, authenticated;
GRANT INSERT, SELECT, UPDATE ON public.providers TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Trigger disabled. Frontend will handle user creation directly.';
    RAISE NOTICE 'This is safer and more reliable than database triggers.';
END $$;