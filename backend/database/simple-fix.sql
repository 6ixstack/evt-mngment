-- ================================
-- SIMPLE PROVIDER SIGNUP FIX
-- Minimal working solution
-- ================================

-- 1. Remove everything trigger-related
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Create the simplest possible working function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Just insert the basic record, handle user_type in frontend
    INSERT INTO public.users (id, name, email, type)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        'user'::user_type
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.providers TO postgres, anon, authenticated, service_role;

-- 5. Test message
DO $$
BEGIN
    RAISE NOTICE '✅ Simplified trigger created. Now test signup and then run the update script.';
END $$;