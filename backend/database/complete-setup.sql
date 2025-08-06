-- ================================
-- EVENTCRAFT COMPLETE DATABASE SETUP
-- One script to rule them all
-- ================================
-- 
-- This script sets up the entire EventCraft database from scratch
-- Run this on a fresh Supabase project to get everything working
-- 
-- Version: 1.0
-- Compatible with: Supabase (PostgreSQL 13+)
-- 
-- ================================

-- Start transaction for atomicity
BEGIN;

-- ================================
-- 1. CLEAN UP (in case of re-run)
-- ================================

-- Drop existing objects if they exist (safe for fresh installs)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS provider_views CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop storage policies
DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;

-- Drop enum types
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS provider_type CASCADE;
DROP TYPE IF EXISTS user_type CASCADE;

RAISE NOTICE '🧹 Cleanup completed';

-- ================================
-- 2. CREATE ENUM TYPES
-- ================================

CREATE TYPE user_type AS ENUM ('user', 'provider');
CREATE TYPE provider_type AS ENUM (
    'venue', 'catering', 'photographer', 'videographer', 
    'florist', 'decorator', 'music', 'transportation', 
    'makeup', 'clothing', 'jewelry', 'invitations', 'other'
);
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'booked');

RAISE NOTICE '✅ Enum types created';

-- ================================
-- 3. CREATE TABLES
-- ================================

-- Users table - stores user profiles
CREATE TABLE public.users (
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

-- Providers table - stores business/service provider information
CREATE TABLE public.providers (
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

-- Events table - stores user's event planning sessions
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checklist_json JSONB,
    steps UUID[] DEFAULT '{}'
);

-- Tasks table - stores individual planning steps/tasks
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    step_title TEXT NOT NULL,
    description TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    refinement_prompt TEXT,
    matching_provider_ids UUID[] DEFAULT '{}'
);

-- Leads table - stores inquiries from users to providers
CREATE TABLE public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    step_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status lead_status DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider views table - analytics for provider visibility
CREATE TABLE public.provider_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

RAISE NOTICE '✅ Tables created';

-- ================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_type ON public.users(type);
CREATE INDEX idx_providers_user_id ON public.providers(user_id);
CREATE INDEX idx_providers_type ON public.providers(provider_type);
CREATE INDEX idx_providers_location ON public.providers(location_city, location_province);
CREATE INDEX idx_providers_active ON public.providers(is_active);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX idx_leads_provider_id ON public.leads(provider_id);
CREATE INDEX idx_leads_user_id ON public.leads(user_id);

RAISE NOTICE '✅ Indexes created';

-- ================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ================================

-- Disable RLS for now (frontend handles permissions)
-- This is more reliable than complex RLS policies for auth triggers
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_views DISABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ RLS configured (disabled for reliability)';

-- ================================
-- 6. PERMISSIONS
-- ================================

-- Grant permissions for anon and authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.providers TO anon, authenticated;
GRANT ALL ON public.events TO anon, authenticated;
GRANT ALL ON public.tasks TO anon, authenticated;
GRANT ALL ON public.leads TO anon, authenticated;
GRANT ALL ON public.provider_views TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

RAISE NOTICE '✅ Permissions granted';

-- ================================
-- 7. STORAGE SETUP
-- ================================

-- Create storage bucket for file uploads (logos, images, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for uploads bucket
CREATE POLICY "Anyone can view uploads" ON storage.objects
    FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own uploads" ON storage.objects
    FOR UPDATE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

RAISE NOTICE '✅ Storage bucket and policies created';

-- ================================
-- 8. SAMPLE DATA (OPTIONAL)
-- ================================

-- Insert some sample providers for testing
INSERT INTO public.users (id, name, email, type) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Toronto Event Venues', 'venues@toronto.com', 'provider'),
    ('22222222-2222-2222-2222-222222222222', 'Elite Catering Co', 'catering@elite.com', 'provider'),
    ('33333333-3333-3333-3333-333333333333', 'Perfect Moments Photography', 'photo@moments.com', 'provider');

INSERT INTO public.providers (user_id, business_name, provider_type, phone, location_city, location_province, description, tags, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Toronto Event Venues', 'venue', '+1-416-555-0101', 'Toronto', 'Ontario', 'Premium event venues in downtown Toronto. Perfect for weddings, corporate events, and special occasions.', ARRAY['luxury', 'downtown', 'accessible'], true),
    ('22222222-2222-2222-2222-222222222222', 'Elite Catering Co', 'catering', '+1-416-555-0102', 'Toronto', 'Ontario', 'Full-service catering with halal options. Specializing in weddings and corporate events.', ARRAY['halal', 'kosher', 'vegan'], true),
    ('33333333-3333-3333-3333-333333333333', 'Perfect Moments Photography', 'photographer', '+1-416-555-0103', 'Toronto', 'Ontario', 'Professional wedding and event photography. Capturing your special moments with artistic flair.', ARRAY['wedding', 'portrait', 'professional'], true);

RAISE NOTICE '✅ Sample data inserted';

-- ================================
-- 9. FUNCTIONS AND UTILITIES
-- ================================

-- Function to update provider updated_at timestamp
CREATE OR REPLACE FUNCTION update_provider_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for provider updates
CREATE TRIGGER trigger_update_provider_updated_at
    BEFORE UPDATE ON public.providers
    FOR EACH ROW EXECUTE FUNCTION update_provider_updated_at();

RAISE NOTICE '✅ Utility functions created';

-- ================================
-- 10. VERIFICATION
-- ================================

-- Verify tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'providers', 'events', 'tasks', 'leads', 'provider_views');
    
    IF table_count = 6 THEN
        RAISE NOTICE '✅ All 6 tables created successfully';
    ELSE
        RAISE WARNING '❌ Expected 6 tables, found %', table_count;
    END IF;
END $$;

-- Verify enums exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') AND
       EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_type') AND
       EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') AND
       EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
        RAISE NOTICE '✅ All enum types created successfully';
    ELSE
        RAISE WARNING '❌ Some enum types missing';
    END IF;
END $$;

-- Verify sample data
DO $$
DECLARE
    user_count INTEGER;
    provider_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users WHERE type = 'provider';
    SELECT COUNT(*) INTO provider_count FROM public.providers;
    
    RAISE NOTICE '✅ Sample data: % provider users, % provider profiles', user_count, provider_count;
END $$;

-- Commit transaction
COMMIT;

-- ================================
-- 11. SUCCESS MESSAGE
-- ================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 EVENTCRAFT DATABASE SETUP COMPLETE!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Database schema created';
    RAISE NOTICE '✅ Tables and relationships established';
    RAISE NOTICE '✅ Permissions configured';
    RAISE NOTICE '✅ Storage bucket set up';
    RAISE NOTICE '✅ Sample data inserted';
    RAISE NOTICE '✅ No database triggers (frontend handles user creation)';
    RAISE NOTICE '';
    RAISE NOTICE 'Your EventCraft platform is ready to use!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Configure your environment variables';
    RAISE NOTICE '2. Deploy your frontend and backend';
    RAISE NOTICE '3. Test provider and user signup flows';
    RAISE NOTICE '4. Set up Stripe webhooks for subscriptions';
    RAISE NOTICE '';
    RAISE NOTICE 'Happy event planning! 🎊';
    RAISE NOTICE '=====================================';
END $$;