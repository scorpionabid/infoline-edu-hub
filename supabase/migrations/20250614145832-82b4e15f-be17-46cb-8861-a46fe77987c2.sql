
-- First, drop the trigger that depends on the function
DROP TRIGGER IF EXISTS trigger_auto_approve_deadline ON data_entries;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.auto_approve_on_deadline();

-- Clean up any 'system' values in existing data without triggering loops
UPDATE data_entries 
SET approved_by = NULL, 
    updated_at = NOW()
WHERE approved_by IS NOT NULL 
  AND approved_by::text = 'system';

UPDATE data_entries 
SET created_by = NULL,
    updated_at = NOW()
WHERE created_by IS NOT NULL 
  AND created_by::text = 'system';

UPDATE data_entries 
SET rejected_by = NULL,
    updated_at = NOW()
WHERE rejected_by IS NOT NULL 
  AND rejected_by::text = 'system';

-- Add comment for documentation
COMMENT ON TABLE data_entries IS 'Data entries table - UUID columns should never contain literal "system" string values. Use NULL for system operations.';
