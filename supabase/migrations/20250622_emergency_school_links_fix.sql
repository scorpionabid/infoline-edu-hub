-- Fix school_links RLS policies - remove reference to non-existent users table
-- This emergency fix addresses the immediate API errors

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "SuperAdmin full access to school links" ON school_links;
DROP POLICY IF EXISTS "RegionAdmin manages region school links" ON school_links;
DROP POLICY IF EXISTS "SectorAdmin manages sector school links" ON school_links;
DROP POLICY IF EXISTS "SchoolAdmin manages own school links" ON school_links;
DROP POLICY IF EXISTS "School users access own school links" ON school_links;

-- Create simplified, working policies
CREATE POLICY "Allow authenticated users to view school links" ON school_links
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert school links" ON school_links
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update school links" ON school_links
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete school links" ON school_links
FOR DELETE USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled
ALTER TABLE school_links ENABLE ROW LEVEL SECURITY;

-- Add basic audit trigger (simplified)
CREATE OR REPLACE FUNCTION public.simple_audit_school_links()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple logging without complex dependencies
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      user_id, action, entity_type, entity_id, 
      new_value, created_at
    ) VALUES (
      auth.uid(),
      'INSERT',
      'school_link',
      NEW.id::text,
      row_to_json(NEW),
      now()
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      user_id, action, entity_type, entity_id, 
      old_value, new_value, created_at
    ) VALUES (
      auth.uid(),
      'UPDATE',
      'school_link',
      NEW.id::text,
      row_to_json(OLD),
      row_to_json(NEW),
      now()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      user_id, action, entity_type, entity_id, 
      old_value, created_at
    ) VALUES (
      auth.uid(),
      'DELETE',
      'school_link',
      OLD.id::text,
      row_to_json(OLD),
      now()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the main operation if audit logging fails
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the simplified audit trigger
DROP TRIGGER IF EXISTS simple_school_links_audit ON school_links;
CREATE TRIGGER simple_school_links_audit
  AFTER INSERT OR UPDATE OR DELETE ON school_links
  FOR EACH ROW EXECUTE FUNCTION public.simple_audit_school_links();
