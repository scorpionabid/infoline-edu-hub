-- ANALYSIS ONLY - DO NOT RUN YET
-- This query will show us the exact policies and their conditions

-- Check current policies on school_links
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'school_links';

-- Check what tables exist that might be referenced
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'profiles', 'user_roles', 'schools');

-- Check user_roles table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_roles';

-- Check if there are any functions that reference users table
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_definition LIKE '%users%';
