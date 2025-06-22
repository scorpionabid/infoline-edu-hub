-- SAFE ANALYSIS - Find the exact problem
-- Run these queries in Supabase SQL Editor to understand the issue

-- 1. Check which policies exist and their exact conditions
SELECT 
    policyname,
    cmd,
    qual as "SELECT condition",
    with_check as "INSERT/UPDATE condition"
FROM pg_policies 
WHERE tablename = 'school_links'
ORDER BY policyname;

-- 2. Look for any references to 'users' table in the policy conditions
SELECT 
    policyname,
    CASE 
        WHEN qual LIKE '%users%' THEN 'FOUND users reference in SELECT condition'
        WHEN with_check LIKE '%users%' THEN 'FOUND users reference in INSERT/UPDATE condition'
        ELSE 'No users reference found'
    END as issue_location
FROM pg_policies 
WHERE tablename = 'school_links'
AND (qual LIKE '%users%' OR with_check LIKE '%users%');

-- 3. Check what functions might be referencing users table
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE prosrc LIKE '%users%' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
