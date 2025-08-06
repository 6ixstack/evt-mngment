-- ================================
-- SIMPLE SETUP - NO TRIGGERS
-- This removes complexity to avoid auth errors
-- ================================

-- 1. Create user type enum
CREATE TYPE user_type AS ENUM ('user', 'provider');

-- 2. Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    type user_type NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Create simple policies
-- Anyone can read profiles
CREATE POLICY "Anyone can view profiles" ON users
    FOR SELECT USING (true);

-- Anyone can insert during signup (frontend will handle)
CREATE POLICY "Anyone can insert profile" ON users
    FOR INSERT WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 5. Grant permissions
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- 6. Create provider type enum
CREATE TYPE provider_type AS ENUM (
    'venue', 'catering', 'photographer', 'videographer', 
    'florist', 'decorator', 'music', 'transportation', 
    'makeup', 'clothing', 'jewelry', 'invitations', 'other'
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
    subscription_status TEXT DEFAULT 'inactive',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 8. Enable RLS on providers
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- 9. Provider policies
CREATE POLICY "Anyone can view providers" ON providers
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert provider" ON providers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Providers can update own profile" ON providers
    FOR UPDATE USING (user_id = auth.uid());

-- 10. Grant permissions
GRANT ALL ON providers TO anon;
GRANT ALL ON providers TO authenticated;
GRANT ALL ON providers TO service_role;

-- ================================
-- THAT'S IT! 
-- No triggers, no complex functions
-- Frontend handles user creation
-- ================================