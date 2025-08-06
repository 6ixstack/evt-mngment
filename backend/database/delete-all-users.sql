-- ================================
-- DELETE ALL USERS - FRESH START
-- This will delete all user accounts and data
-- ================================

-- 1. Delete from public tables first (due to foreign key constraints)
DELETE FROM provider_views;
DELETE FROM leads;
DELETE FROM tasks;
DELETE FROM events;
DELETE FROM providers;
DELETE FROM users;

-- 2. Delete from auth tables (this removes all user accounts)
DELETE FROM auth.identities;
DELETE FROM auth.users;

-- 3. Verify cleanup
SELECT 'Cleanup verification:' as status;
SELECT 'Public users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Auth users:', COUNT(*) FROM auth.users
UNION ALL
SELECT 'Providers:', COUNT(*) FROM providers
UNION ALL
SELECT 'Events:', COUNT(*) FROM events;

SELECT 'All users deleted! Ready for fresh testing.' as result;