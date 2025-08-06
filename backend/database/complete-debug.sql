-- ================================
-- COMPLETE DEBUG - SHOW ALL DATA
-- ================================

-- 1. Show all users in users table
SELECT 'USERS TABLE:' as section, COUNT(*) as total_count FROM users;
SELECT id, email, name, type, created_at FROM users ORDER BY created_at DESC;

-- 2. Show all auth users  
SELECT 'AUTH USERS TABLE:' as section, COUNT(*) as total_count FROM auth.users;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 3. Show users that exist in auth but NOT in users table
SELECT 'ORPHANED AUTH USERS (in auth but not in users):' as section;
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id  
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- 4. Try to manually create a user profile for the missing user
-- Replace with your actual user ID from the error
DO $$
DECLARE
    missing_user_id UUID;
    missing_email TEXT;
    missing_name TEXT;
BEGIN
    -- Get the first orphaned user
    SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'full_name', au.email)
    INTO missing_user_id, missing_email, missing_name
    FROM auth.users au
    LEFT JOIN users u ON au.id = u.id  
    WHERE u.id IS NULL
    ORDER BY au.created_at DESC
    LIMIT 1;
    
    IF missing_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found orphaned user: % (%) - attempting to create profile', missing_email, missing_user_id;
        
        INSERT INTO users (id, email, name, type)
        VALUES (missing_user_id, missing_email, missing_name, 'user');
        
        RAISE NOTICE 'Successfully created user profile!';
    ELSE
        RAISE NOTICE 'No orphaned users found';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user profile: %', SQLERRM;
END $$;

-- 5. Show final state
SELECT 'FINAL CHECK:' as section;
SELECT 'Total auth users:' as metric, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'Total profile users:', COUNT(*) FROM users
UNION ALL  
SELECT 'Orphaned users:', COUNT(*) 
FROM auth.users au
LEFT JOIN users u ON au.id = u.id  
WHERE u.id IS NULL;