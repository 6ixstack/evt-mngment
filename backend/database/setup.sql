-- ================================
-- EVENTCRAFT COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ================================

-- 1. Create user type enum
CREATE TYPE user_type AS ENUM ('user', 'provider');

-- 2. Create provider type enum
CREATE TYPE provider_type AS ENUM (
    'venue', 'catering', 'photographer', 'videographer', 
    'florist', 'decorator', 'music', 'transportation', 
    'makeup', 'clothing', 'jewelry', 'invitations', 'other'
);

-- 3. Create subscription status enum
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trial', 'cancelled');

-- 4. Create lead status enum
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');

-- 5. Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    type user_type NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create providers table
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

-- 7. Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    checklist_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create tasks table
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

-- 9. Create leads table
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

-- 10. Create provider_views table for analytics
CREATE TABLE provider_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_views ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies for users table
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 13. Create RLS policies for providers table
CREATE POLICY "Anyone can view active providers" ON providers
    FOR SELECT USING (subscription_status = 'active' OR user_id = auth.uid());

CREATE POLICY "Providers can insert own profile" ON providers
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Providers can update own profile" ON providers
    FOR UPDATE USING (user_id = auth.uid());

-- 14. Create RLS policies for events table
CREATE POLICY "Users can view own events" ON events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON events
    FOR DELETE USING (auth.uid() = user_id);

-- 15. Create RLS policies for tasks table
CREATE POLICY "Users can manage tasks for own events" ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = tasks.event_id 
            AND events.user_id = auth.uid()
        )
    );

-- 16. Create RLS policies for leads table
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

-- 17. Create RLS policies for provider_views
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

-- 18. Create indexes for better performance
CREATE INDEX idx_providers_location ON providers(location_city, location_province);
CREATE INDEX idx_providers_type ON providers(provider_type);
CREATE INDEX idx_providers_status ON providers(subscription_status);
CREATE INDEX idx_leads_provider ON leads(provider_id);
CREATE INDEX idx_leads_user ON leads(user_id);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_tasks_event ON tasks(event_id);

-- 19. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 20. Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 21. Grant necessary permissions
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON providers TO anon, authenticated;
GRANT ALL ON events TO anon, authenticated;
GRANT ALL ON tasks TO anon, authenticated;
GRANT ALL ON leads TO anon, authenticated;
GRANT ALL ON provider_views TO anon, authenticated;

-- 22. Create storage buckets (run in Storage section of Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('provider-logos', 'provider-logos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('provider-images', 'provider-images', true);

-- 23. Storage policies (run after creating buckets)
-- CREATE POLICY "Providers can upload logos" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'provider-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Providers can update own logos" ON storage.objects
--     FOR UPDATE USING (bucket_id = 'provider-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Anyone can view logos" ON storage.objects
--     FOR SELECT USING (bucket_id = 'provider-logos');

-- CREATE POLICY "Providers can upload images" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'provider-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Providers can update own images" ON storage.objects
--     FOR UPDATE USING (bucket_id = 'provider-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Anyone can view provider images" ON storage.objects
--     FOR SELECT USING (bucket_id = 'provider-images');

-- 24. Create user management functions
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    user_type user_type DEFAULT 'user'
) RETURNS void AS $$
BEGIN
    INSERT INTO users (id, email, name, type)
    VALUES (user_id, user_email, user_name, user_type)
    ON CONFLICT (id) DO UPDATE
    SET 
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 25. Function to handle auth user creation
CREATE OR REPLACE FUNCTION handle_auth_user_created() RETURNS trigger AS $$
DECLARE
    user_type_value user_type;
    user_name_value TEXT;
BEGIN
    -- Extract user type from metadata or default to 'user'
    user_type_value := COALESCE(
        (NEW.raw_user_meta_data->>'user_type')::user_type,
        'user'::user_type
    );
    
    -- Extract name from metadata
    user_name_value := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Create user profile
    PERFORM create_user_profile(
        NEW.id,
        NEW.email,
        user_name_value,
        user_type_value
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 26. Create trigger for automatic user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_auth_user_created();

-- 27. RPC function for updating user type (OAuth flows)
CREATE OR REPLACE FUNCTION set_user_type(
    user_id UUID,
    new_user_type user_type
) RETURNS void AS $$
BEGIN
    -- Ensure the user can only update their own type
    IF auth.uid() != user_id THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    -- Update or insert user record
    INSERT INTO users (id, email, name, type)
    SELECT 
        user_id,
        auth.email(),
        COALESCE(
            auth.jwt()->>'user_metadata'->>'full_name',
            auth.jwt()->>'user_metadata'->>'name',
            split_part(auth.email(), '@', 1)
        ),
        new_user_type
    ON CONFLICT (id) DO UPDATE
    SET type = new_user_type, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 28. Grant function permissions
GRANT EXECUTE ON FUNCTION create_user_profile TO service_role;
GRANT EXECUTE ON FUNCTION handle_auth_user_created TO service_role;
GRANT EXECUTE ON FUNCTION set_user_type TO authenticated;

-- ================================
-- SETUP COMPLETE!
-- ================================
-- The database now includes:
-- 1. Automatic user creation via trigger
-- 2. RPC function for OAuth user type updates
-- 3. All tables, policies, and permissions