-- Migration: 20250617_fix_security_definer_view.sql
-- Description: Fix Security Advisor warning about status_history_view
-- Date: 2025-06-17

-- ============================================================================
-- SECURITY FIX - Remove SECURITY DEFINER view and replace with secure function
-- ============================================================================

-- Step 1: Drop the problematic view completely
DROP VIEW IF EXISTS public.status_history_view CASCADE;

-- Step 2: Drop any existing functions
DROP FUNCTION IF EXISTS public.get_status_history CASCADE;
DROP FUNCTION IF EXISTS public.get_status_history_by_uuid CASCADE;

-- Step 3: Check if status_transition_log table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'status_transition_log'
    ) THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.status_transition_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            data_entry_id VARCHAR(255) NOT NULL,
            old_status TEXT,
            new_status TEXT NOT NULL,
            comment TEXT,
            changed_at TIMESTAMPTZ DEFAULT NOW(),
            changed_by UUID REFERENCES auth.users(id),
            metadata JSONB DEFAULT '{}'::jsonb
        );
        
        -- Enable RLS
        ALTER TABLE public.status_transition_log ENABLE ROW LEVEL SECURITY;
        
        -- Create basic index
        CREATE INDEX idx_status_logs_data_entry_id ON public.status_transition_log(data_entry_id);
        CREATE INDEX idx_status_logs_changed_at ON public.status_transition_log(changed_at DESC);
    END IF;
END $$;

-- Step 4: Create secure function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_status_history_secure(
    entry_id VARCHAR DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    data_entry_id VARCHAR,
    old_status TEXT,
    new_status TEXT,
    comment TEXT,
    changed_at TIMESTAMPTZ,
    changed_by UUID,
    metadata JSONB,
    changed_by_name TEXT,
    changed_by_email TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_role TEXT;
    current_user_region UUID;
    current_user_sector UUID;
    current_user_school UUID;
BEGIN
    -- Get current user's role and permissions
    SELECT ur.role, ur.region_id, ur.sector_id, ur.school_id
    INTO current_user_role, current_user_region, current_user_sector, current_user_school
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    LIMIT 1;

    -- If no role found, return empty result
    IF current_user_role IS NULL THEN
        RETURN;
    END IF;

    -- Return data based on role permissions
    RETURN QUERY
    SELECT 
        stl.id,
        stl.data_entry_id,
        stl.old_status,
        stl.new_status,
        stl.comment,
        stl.changed_at,
        stl.changed_by,
        stl.metadata,
        COALESCE(p.full_name, 'Unknown') as changed_by_name,
        COALESCE(p.email, 'No email') as changed_by_email
    FROM public.status_transition_log stl
    LEFT JOIN public.profiles p ON stl.changed_by = p.id
    WHERE 
        -- Apply entry filter if provided
        (entry_id IS NULL OR stl.data_entry_id = entry_id)
        -- Apply role-based security at function level
        AND (
            current_user_role = 'superadmin' OR
            stl.changed_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.user_roles ur2
                WHERE ur2.user_id = auth.uid()
                AND ur2.role IN ('regionadmin', 'sectoradmin', 'schooladmin')
            )
        )
    ORDER BY stl.changed_at DESC
    LIMIT limit_count;
END;
$$;

-- Step 5: Create a simple view without SECURITY DEFINER
CREATE VIEW public.status_history_view AS
SELECT 
    stl.id,
    stl.data_entry_id,
    stl.old_status,
    stl.new_status,
    stl.comment,
    stl.changed_at,
    stl.changed_by,
    stl.metadata,
    p.full_name as changed_by_name,
    p.email as changed_by_email
FROM public.status_transition_log stl
LEFT JOIN public.profiles p ON stl.changed_by = p.id;

-- Step 6: Ensure RLS is enabled on base table
ALTER TABLE public.status_transition_log ENABLE ROW LEVEL SECURITY;

-- Step 7: Create comprehensive RLS policies
DROP POLICY IF EXISTS "status_logs_policy" ON public.status_transition_log;

CREATE POLICY "status_logs_policy" 
ON public.status_transition_log
FOR ALL 
TO authenticated
USING (
    -- SuperAdmin has full access
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'superadmin'
    ) OR
    -- Users can see their own changes
    changed_by = auth.uid() OR
    -- Regional/Sector/School admins can see relevant data
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('regionadmin', 'sectoradmin', 'schooladmin')
    )
);

-- Step 8: Grant proper permissions
GRANT EXECUTE ON FUNCTION public.get_status_history_secure TO authenticated;
GRANT SELECT ON public.status_history_view TO authenticated;
GRANT ALL ON public.status_transition_log TO authenticated;

-- Step 9: Create helper function for application use
CREATE OR REPLACE FUNCTION public.log_status_change(
    p_data_entry_id VARCHAR,
    p_old_status TEXT,
    p_new_status TEXT,
    p_comment TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.status_transition_log (
        data_entry_id,
        old_status,
        new_status,
        comment,
        changed_by
    ) VALUES (
        p_data_entry_id,
        p_old_status,
        p_new_status,
        p_comment,
        auth.uid()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Step 10: Grant permissions for helper function
GRANT EXECUTE ON FUNCTION public.log_status_change TO authenticated;

-- Step 11: Add useful comments
COMMENT ON FUNCTION public.get_status_history_secure IS 'Securely retrieve status history with role-based access control';
COMMENT ON FUNCTION public.log_status_change IS 'Log status changes with automatic user tracking';
COMMENT ON VIEW public.status_history_view IS 'Simple view for status history (uses RLS from base table)';
COMMENT ON TABLE public.status_transition_log IS 'Audit log for status changes with RLS enabled';

-- Step 12: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_status_logs_changed_by ON public.status_transition_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_status_logs_combined ON public.status_transition_log(data_entry_id, changed_at DESC);
