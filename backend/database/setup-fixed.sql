-- ================================
-- EVENTCRAFT SETUP - FIXED VERSION
-- This version avoids trigger issues
-- ================================

-- 1. Drop everything first (to ensure clean state)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT, user_type) CASCADE;
DROP FUNCTION IF EXISTS set_user_type(UUID, user_type) CASCADE;
DROP TABLE IF EXISTS provider_views CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS provider_type CASCADE;
DROP TYPE IF EXISTS user_type CASCADE;

-- 2. Create user type enum
CREATE TYPE user_type AS ENUM ('user', 'provider');

-- 3. Create provider type enum
CREATE TYPE provider_type AS ENUM (
    'venue', 'catering', 'photographer', 'videographer', 
    'florist', 'decorator', 'music', 'transportation', 
    'makeup', 'clothing', 'jewelry', 'invitations', 'other'
);

-- 4. Create subscription status enum
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trial', 'cancelled');

-- 5. Create lead status enum
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');

-- 6. Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    type user_type NOT NULL DEFAULT 'user',
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create providers table
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    provider_type provider_type NOT NULL,
    phone TEXT,
    location_city TEXT NOT NULL,
    location_province TEXT NOT NULL,
    location_lat FLOAT,
    location_lng FLOAT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    logo_url TEXT,
    sample_images TEXT[] DEFAULT '{}',
    subscription_status subscription_status DEFAULT 'inactive',
    subscription_expires_at TIMESTAMPTZ,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 8. Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    checklist_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    order_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    status lead_status DEFAULT 'new',
    message TEXT,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    event_date DATE,
    event_type TEXT,
    guest_count INTEGER,
    budget TEXT,
    contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Create provider_views table
CREATE TABLE provider_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_views ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS policies for users table
-- IMPORTANT: Very permissive for signup to work
CREATE POLICY "Public profiles are viewable by everyone" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert during signup" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 14. Create RLS policies for providers table
CREATE POLICY "Anyone can view providers" ON providers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert provider profile" ON providers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can update own profile" ON providers
    FOR UPDATE USING (auth.uid() = user_id);

-- 15. Create RLS policies for events table
CREATE POLICY "Users can view own events" ON events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON events
    FOR DELETE USING (auth.uid() = user_id);

-- 16. Create RLS policies for tasks table
CREATE POLICY "Users can manage tasks for own events" ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = tasks.event_id 
            AND events.user_id = auth.uid()
        )
    );

-- 17. Create RLS policies for leads table
CREATE POLICY "Providers can view own leads" ON leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers 
            WHERE providers.id = leads.provider_id 
            AND providers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT USING (auth.uid() = user_id);

-- 18. Create RLS policies for provider_views
CREATE POLICY "Anyone can insert views" ON provider_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Providers can view own analytics" ON provider_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers 
            WHERE providers.id = provider_views.provider_id 
            AND providers.user_id = auth.uid()
        )
    );

-- 19. Create indexes
CREATE INDEX idx_providers_location ON providers(location_city, location_province);
CREATE INDEX idx_providers_type ON providers(provider_type);
CREATE INDEX idx_providers_status ON providers(subscription_status);
CREATE INDEX idx_leads_provider ON leads(provider_id);
CREATE INDEX idx_leads_user ON leads(user_id);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_tasks_event ON tasks(event_id);

-- 20. Grant ALL permissions (very permissive for development)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE ON TYPE user_type TO anon;
GRANT USAGE ON TYPE user_type TO authenticated;
GRANT USAGE ON TYPE provider_type TO anon;
GRANT USAGE ON TYPE provider_type TO authenticated;
GRANT USAGE ON TYPE subscription_status TO anon;
GRANT USAGE ON TYPE subscription_status TO authenticated;
GRANT USAGE ON TYPE lead_status TO anon;
GRANT USAGE ON TYPE lead_status TO authenticated;

-- ================================
-- SETUP COMPLETE!
-- ================================
-- NO TRIGGERS - Frontend handles user creation
-- This avoids the auth error you were getting