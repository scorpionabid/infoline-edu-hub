-- TEMPORARY FIX: Disable RLS for school_links to resolve immediate issue
-- This allows the app to work while we investigate the users table issue

ALTER TABLE school_links DISABLE ROW LEVEL SECURITY;

-- Verify the table is accessible
SELECT COUNT(*) FROM school_links;

-- Optional: Re-enable with a simple policy after testing
-- ALTER TABLE school_links ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "temp_allow_all" ON school_links FOR ALL USING (true);
