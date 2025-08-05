-- Create custom types
CREATE TYPE user_type AS ENUM ('user', 'provider');
CREATE TYPE provider_type AS ENUM ('venue', 'catering', 'photographer', 'videographer', 'florist', 'decorator', 'music', 'transportation', 'makeup', 'clothing', 'jewelry', 'invitations', 'other');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'booked');

-- Users table
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

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Providers table
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

-- Enable RLS on providers table
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Events table
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checklist_json JSONB,
    steps UUID[] DEFAULT '{}'
);

-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    step_title TEXT NOT NULL,
    description TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    refinement_prompt TEXT,
    matching_provider_ids UUID[] DEFAULT '{}'
);

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Leads table
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

-- Enable RLS on leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Provider views table (for analytics)
CREATE TABLE provider_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on provider_views table
ALTER TABLE provider_views ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_type ON providers(provider_type);
CREATE INDEX idx_providers_location ON providers(location_city, location_province);
CREATE INDEX idx_providers_active ON providers(is_active);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_tasks_event_id ON tasks(event_id);
CREATE INDEX idx_leads_provider_id ON leads(provider_id);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_provider_views_provider_id ON provider_views(provider_id);
CREATE INDEX idx_provider_views_created_at ON provider_views(created_at);

-- Updated_at trigger for providers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Anyone can read active providers (for public search)
CREATE POLICY "Anyone can view active providers" ON providers
    FOR SELECT USING (is_active = true);

-- Providers can update their own data
CREATE POLICY "Providers can update own profile" ON providers
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can read their own events
CREATE POLICY "Users can view own events" ON events
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own events
CREATE POLICY "Users can create own events" ON events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can read tasks for their events
CREATE POLICY "Users can view tasks for own events" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = tasks.event_id 
            AND events.user_id = auth.uid()
        )
    );

-- Users can create tasks for their events
CREATE POLICY "Users can create tasks for own events" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = tasks.event_id 
            AND events.user_id = auth.uid()
        )
    );

-- Users can update tasks for their events
CREATE POLICY "Users can update tasks for own events" ON tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = tasks.event_id 
            AND events.user_id = auth.uid()
        )
    );

-- Users can view leads they created
CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT USING (auth.uid() = user_id);

-- Providers can view leads for their services
CREATE POLICY "Providers can view leads for own services" ON leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers 
            WHERE providers.id = leads.provider_id 
            AND providers.user_id = auth.uid()
        )
    );

-- Users can create leads
CREATE POLICY "Users can create leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Providers can update leads for their services
CREATE POLICY "Providers can update own leads" ON leads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM providers 
            WHERE providers.id = leads.provider_id 
            AND providers.user_id = auth.uid()
        )
    );

-- Providers can view analytics for their own profile
CREATE POLICY "Providers can view own analytics" ON provider_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers 
            WHERE providers.id = provider_views.provider_id 
            AND providers.user_id = auth.uid()
        )
    );

-- Anyone can record provider views (anonymous allowed)
CREATE POLICY "Anyone can record provider views" ON provider_views
    FOR INSERT WITH CHECK (true);

-- Storage policies (for Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true);

-- Storage policies
CREATE POLICY "Uploaded files are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own uploaded files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own uploaded files" ON storage.objects
    FOR DELETE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');