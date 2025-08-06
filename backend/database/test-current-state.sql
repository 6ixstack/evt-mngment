-- ================================
-- TEST CURRENT STATE OF DATABASE
-- Check what's actually in the tables
-- ================================

-- Check if user_type enum exists and what values it has
SELECT typname, enumlabel 
FROM pg_type 
JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid 
WHERE typname = 'user_type'
ORDER BY enumsortorder;

-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check recent users
SELECT id, email, type, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check recent auth users
SELECT id, email, raw_user_meta_data->>'user_type' as meta_user_type, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if trigger exists
SELECT tgname, tgtype 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check the trigger function
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';