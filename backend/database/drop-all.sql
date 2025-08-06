-- ================================
-- DROP EVERYTHING - COMPLETE RESET
-- WARNING: This will delete ALL data!
-- ================================

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view active providers" ON providers;
DROP POLICY IF EXISTS "Providers can insert own profile" ON providers;
DROP POLICY IF EXISTS "Providers can update own profile" ON providers;
DROP POLICY IF EXISTS "Users can view own events" ON events;
DROP POLICY IF EXISTS "Users can insert own events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Users can manage tasks for own events" ON tasks;
DROP POLICY IF EXISTS "Providers can view own leads" ON leads;
DROP POLICY IF EXISTS "Users can create leads" ON leads;
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
DROP POLICY IF EXISTS "Anyone can insert views" ON provider_views;
DROP POLICY IF EXISTS "Providers can view own analytics" ON provider_views;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;

-- Drop functions
DROP FUNCTION IF EXISTS handle_auth_user_created();
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT, user_type);
DROP FUNCTION IF EXISTS set_user_type(UUID, user_type);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS provider_views CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS provider_type CASCADE;
DROP TYPE IF EXISTS user_type CASCADE;

-- Optional: Clear auth.users (BE CAREFUL!)
-- This will delete ALL user accounts
-- TRUNCATE auth.users CASCADE;

-- ================================
-- CLEANUP COMPLETE!
-- ================================
-- Now you can run setup.sql for a fresh start