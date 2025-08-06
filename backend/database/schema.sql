-- EventCraft Database Schema
-- Run this in your Supabase SQL Editor to set up the complete database
-- This script safely drops and recreates all objects

-- ================================
-- CLEAN UP EXISTING OBJECTS
-- ================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables (in reverse dependency order)
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

-- ================================
-- ENUM TYPES
-- ================================

CREATE TYPE user_type AS ENUM ('user', 'provider');
CREATE TYPE provider_type AS ENUM ('venue', 'catering', 'photographer', 'videographer', 'florist', 'decorator', 'music', 'transportation', 'makeup', 'clothing', 'jewelry', 'invitations', 'other');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'booked');

-- ================================
-- TABLES
-- ================================

-- Users table - stores user profiles
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE providers (
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
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checklist_json JSONB,
    steps UUID[] DEFAULT '{}'
);

-- Tasks table - stores individual planning steps/tasks
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    step_title TEXT NOT NULL,
    description TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    refinement_prompt TEXT,
    matching_provider_ids UUID[] DEFAULT '{}'
);

-- Leads table - stores inquiries from users to providers
CREATE TABLE leads (
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
CREATE TABLE provider_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_views ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Providers policies
CREATE POLICY "Anyone can view active providers" ON providers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can view own profile" ON providers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Providers can update own profile" ON providers
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Providers can insert own profile" ON providers
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Events policies
CREATE POLICY "Users can view own events" ON events
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own events" ON events
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (user_id = auth.uid());

-- Tasks policies
CREATE POLICY "Users can view tasks for own events" ON tasks
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM events WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tasks for own events" ON tasks
    FOR INSERT WITH CHECK (
        event_id IN (
            SELECT id FROM events WHERE user_id = auth.uid()
        )
    );

-- Leads policies
CREATE POLICY "Users can view own leads as user" ON leads
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Providers can view leads for their services" ON leads
    FOR SELECT USING (
        provider_id IN (
            SELECT id FROM providers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create leads" ON leads
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Provider views policies
CREATE POLICY "Anyone can insert provider views" ON provider_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Providers can view their own analytics" ON provider_views
    FOR SELECT USING (
        provider_id IN (
            SELECT id FROM providers WHERE user_id = auth.uid()
        )
    );

-- ================================
-- AUTO USER CREATION TRIGGER
-- ================================

-- Function to automatically create user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'user')::user_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires whenever a new user signs up via Supabase Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================
-- STORAGE CONFIGURATION
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