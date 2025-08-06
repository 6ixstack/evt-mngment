-- ================================
-- EVENTCRAFT PROVIDER SIGNUP FIX
-- Complete End-to-End Setup Script
-- ================================

-- This script ensures provider signup works correctly from start to finish

-- ================================
-- 1. CLEAN UP EXISTING SETUP
-- ================================

-- Remove existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ================================
-- 2. ENSURE REQUIRED TYPES EXIST  
-- ================================

-- Create user_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('user', 'provider');
        RAISE NOTICE 'Created user_type enum';
    ELSE
        RAISE NOTICE 'user_type enum already exists';
    END IF;
END $$;

-- Create provider_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_type') THEN
        CREATE TYPE provider_type AS ENUM ('venue', 'catering', 'photographer', 'videographer', 'florist', 'decorator', 'music', 'transportation', 'makeup', 'clothing', 'jewelry', 'invitations', 'other');
        RAISE NOTICE 'Created provider_type enum';
    ELSE
        RAISE NOTICE 'provider_type enum already exists';
    END IF;
END $$;

-- Create subscription_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due');
        RAISE NOTICE 'Created subscription_status enum';
    ELSE
        RAISE NOTICE 'subscription_status enum already exists';
    END IF;
END $$;

-- ================================
-- 3. ENSURE TABLES EXIST
-- ================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    type user_type NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    stripe_customer_id TEXT
);

-- Create providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    provider_type provider_type NOT NULL,
    phone TEXT NOT NULL,
    location_city TEXT NOT NULL,
    location_province TEXT NOT NULL,
    location_lat DECIMAL(9,6),
    location_lng DECIMAL(9,6),
    description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    logo_url TEXT,
    sample_images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT FALSE,
    subscription_status subscription_status DEFAULT 'inactive',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 4. SETUP RLS POLICIES
-- ================================

-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view active providers" ON public.providers;
DROP POLICY IF EXISTS "Providers can view own profile" ON public.providers;
DROP POLICY IF EXISTS "Providers can update own profile" ON public.providers;
DROP POLICY IF EXISTS "Providers can insert own profile" ON public.providers;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view active providers" ON public.providers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can view own profile" ON public.providers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Providers can update own profile" ON public.providers
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Providers can insert own profile" ON public.providers
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ================================
-- 5. CREATE ROBUST TRIGGER FUNCTION
-- ================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_type_value user_type;
    user_name TEXT;
BEGIN
    -- Extract user type from metadata
    user_type_value := CASE 
        WHEN NEW.raw_user_meta_data->>'user_type' = 'provider' THEN 'provider'::user_type
        ELSE 'user'::user_type
    END;
    
    -- Extract user name from metadata
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Insert user record
    INSERT INTO public.users (id, name, email, type, created_at)
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        user_type_value,
        NOW()
    );
    
    -- Log success
    RAISE LOG 'Successfully created user record: id=%, email=%, type=%', NEW.id, NEW.email, user_type_value;
    
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        -- User already exists, just log and continue
        RAISE LOG 'User record already exists for id=%, email=%', NEW.id, NEW.email;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error details but don't fail auth
        RAISE WARNING 'handle_new_user failed for id=%, email=%: % %', NEW.id, NEW.email, SQLSTATE, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 6. CREATE THE TRIGGER
-- ================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================
-- 7. VERIFICATION QUERIES
-- ================================

-- Verify the trigger was created
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_schema = 'auth' 
    AND event_object_table = 'users';
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ Trigger on_auth_user_created created successfully';
    ELSE
        RAISE WARNING '❌ Trigger on_auth_user_created was NOT created';
    END IF;
END $$;

-- Verify function exists
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'handle_new_user';
    
    IF function_count > 0 THEN
        RAISE NOTICE '✅ Function handle_new_user created successfully';
    ELSE
        RAISE WARNING '❌ Function handle_new_user was NOT created';
    END IF;
END $$;

-- Verify enum types exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        RAISE NOTICE '✅ user_type enum exists';
    ELSE
        RAISE WARNING '❌ user_type enum missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_type') THEN
        RAISE NOTICE '✅ provider_type enum exists';
    ELSE
        RAISE WARNING '❌ provider_type enum missing';
    END IF;
END $$;

-- Verify tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ users table exists';
    ELSE
        RAISE WARNING '❌ users table missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ providers table exists';
    ELSE
        RAISE WARNING '❌ providers table missing';
    END IF;
END $$;

-- ================================
-- 8. FINAL SUCCESS MESSAGE
-- ================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 EVENTCRAFT PROVIDER SIGNUP SETUP COMPLETE!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'The system is now ready for end-to-end provider signup testing.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Try signing up as a provider on the website';
    RAISE NOTICE '2. Check that user record is created with type=provider';
    RAISE NOTICE '3. Verify provider can access provider dashboard';
    RAISE NOTICE '';
    RAISE NOTICE 'If issues persist, check the PostgreSQL logs for trigger errors.';
    RAISE NOTICE '=====================================';
END $$;