-- Enhanced Column Deletion with Data Cleanup
-- Bu function sütunları və əlaqəli məlumatları təhlükəsiz şəkildə silir

CREATE OR REPLACE FUNCTION enhanced_delete_column_with_data(
    p_column_id UUID,
    p_user_id UUID,
    p_hard_delete BOOLEAN DEFAULT FALSE,
    p_export_data BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    v_can_delete BOOLEAN;
    v_user_role TEXT;
    v_data_count INTEGER;
    v_sector_data_count INTEGER;
    v_column_name TEXT;
    v_column_info JSON;
    v_result JSON;
    v_export_path TEXT;
    v_deleted_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current timestamp
    v_deleted_at := NOW();
    
    -- Get user role
    SELECT role INTO v_user_role 
    FROM user_roles 
    WHERE user_id = p_user_id;
    
    -- Check permissions
    IF v_user_role NOT IN ('superadmin', 'regionadmin') THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Insufficient permissions to delete columns'
        );
    END IF;
    
    -- Additional check for hard delete (only superadmin)
    IF p_hard_delete AND v_user_role != 'superadmin' THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Hard delete is only allowed for superadmin'
        );
    END IF;
    
    -- Get column information
    SELECT c.name, 
           json_build_object(
               'id', c.id,
               'name', c.name,
               'type', c.type,
               'category_id', c.category_id,
               'status', c.status,
               'created_at', c.created_at
           )
    INTO v_column_name, v_column_info
    FROM columns c
    WHERE c.id = p_column_id;
    
    -- Check if column exists
    IF v_column_name IS NULL THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Column not found'
        );
    END IF;
    
    -- Count affected records
    SELECT COUNT(*) INTO v_data_count 
    FROM data_entries WHERE column_id = p_column_id;
    
    SELECT COUNT(*) INTO v_sector_data_count 
    FROM sector_data_entries WHERE column_id = p_column_id;
    
    -- Export data if requested and data exists
    IF p_export_data AND (v_data_count > 0 OR v_sector_data_count > 0) THEN
        -- Generate export (this would call an export function)
        -- v_export_path := export_column_data(p_column_id, v_column_name);
        v_export_path := 'exports/column_' || p_column_id || '_' || extract(epoch from v_deleted_at) || '.xlsx';
    END IF;
    
    -- Perform deletion based on type
    IF p_hard_delete THEN
        -- HARD DELETE - Permanent removal
        
        -- Delete related data first (foreign key order)
        DELETE FROM data_entries WHERE column_id = p_column_id;
        DELETE FROM sector_data_entries WHERE column_id = p_column_id;
        
        -- Delete the column itself
        DELETE FROM columns WHERE id = p_column_id;
        
        -- Create audit log for hard delete
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, 
            old_value, new_value, created_at
        )
        VALUES (
            p_user_id, 'HARD_DELETE_COLUMN', 'columns', p_column_id,
            json_build_object(
                'column_info', v_column_info,
                'deleted_records', json_build_object(
                    'data_entries', v_data_count,
                    'sector_entries', v_sector_data_count
                ),
                'export_path', v_export_path
            ),
            json_build_object(
                'deletion_type', 'permanent',
                'deleted_at', v_deleted_at
            ),
            v_deleted_at
        );
        
        v_result := json_build_object(
            'success', true,
            'deletion_type', 'permanent',
            'deleted_records', json_build_object(
                'data_entries', v_data_count,
                'sector_entries', v_sector_data_count
            ),
            'export_path', v_export_path
        );
        
    ELSE
        -- SOFT DELETE - Mark as deleted, allow restoration
        
        -- Update column status
        UPDATE columns 
        SET 
            status = 'deleted',
            deleted_at = v_deleted_at,
            deleted_by = p_user_id
        WHERE id = p_column_id;
        
        -- Mark related data as deleted (soft delete)
        UPDATE data_entries 
        SET deleted_at = v_deleted_at
        WHERE column_id = p_column_id AND deleted_at IS NULL;
        
        UPDATE sector_data_entries 
        SET deleted_at = v_deleted_at
        WHERE column_id = p_column_id AND deleted_at IS NULL;
        
        -- Create audit log for soft delete
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, 
            old_value, new_value, created_at
        )
        VALUES (
            p_user_id, 'SOFT_DELETE_COLUMN', 'columns', p_column_id,
            json_build_object(
                'column_info', v_column_info,
                'deleted_records', json_build_object(
                    'data_entries', v_data_count,
                    'sector_entries', v_sector_data_count
                ),
                'export_path', v_export_path
            ),
            json_build_object(
                'deletion_type', 'soft',
                'deleted_at', v_deleted_at,
                'restoration_deadline', v_deleted_at + INTERVAL '30 days'
            ),
            v_deleted_at
        );
        
        v_result := json_build_object(
            'success', true,
            'deletion_type', 'soft',
            'deleted_records', json_build_object(
                'data_entries', v_data_count,
                'sector_entries', v_sector_data_count
            ),
            'restoration_deadline', v_deleted_at + INTERVAL '30 days',
            'export_path', v_export_path
        );
    END IF;
    
    -- Invalidate related caches
    -- PERFORM invalidate_cache('columns');
    -- PERFORM invalidate_cache('data_entries');
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, 
            old_value, new_value, created_at
        )
        VALUES (
            p_user_id, 'DELETE_COLUMN_ERROR', 'columns', p_column_id,
            json_build_object('error', SQLERRM),
            json_build_object('timestamp', v_deleted_at),
            v_deleted_at
        );
        
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permission check function for column deletion
CREATE OR REPLACE FUNCTION can_delete_column(
    p_user_id UUID,
    p_column_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_role TEXT;
    v_user_region_id UUID;
    v_column_category_id UUID;
    v_category_assignment TEXT;
BEGIN
    -- Get user role and region
    SELECT role, region_id 
    INTO v_user_role, v_user_region_id
    FROM user_roles 
    WHERE user_id = p_user_id;
    
    -- SuperAdmin can delete any column
    IF v_user_role = 'superadmin' THEN
        RETURN TRUE;
    END IF;
    
    -- RegionAdmin can delete columns in their region
    IF v_user_role = 'regionadmin' THEN
        -- Get column's category assignment
        SELECT c.category_id, cat.assignment
        INTO v_column_category_id, v_category_assignment
        FROM columns c
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.id = p_column_id;
        
        -- RegionAdmin can manage all categories in their region
        -- This logic may need adjustment based on your business rules
        RETURN TRUE;
    END IF;
    
    -- Other roles cannot delete columns
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for expired soft-deleted columns
CREATE OR REPLACE FUNCTION cleanup_expired_deleted_columns()
RETURNS JSON AS $$
DECLARE
    v_expired_count INTEGER;
    v_cleanup_date TIMESTAMP WITH TIME ZONE;
    v_expired_columns JSON;
BEGIN
    v_cleanup_date := NOW();
    
    -- Find and collect expired columns info
    SELECT json_agg(
        json_build_object(
            'id', id,
            'name', name,
            'deleted_at', deleted_at,
            'days_expired', EXTRACT(DAYS FROM (v_cleanup_date - deleted_at))
        )
    )
    INTO v_expired_columns
    FROM columns
    WHERE status = 'deleted' 
    AND deleted_at IS NOT NULL 
    AND deleted_at < v_cleanup_date - INTERVAL '30 days';
    
    -- Count expired columns
    SELECT COUNT(*)
    INTO v_expired_count
    FROM columns
    WHERE status = 'deleted' 
    AND deleted_at IS NOT NULL 
    AND deleted_at < v_cleanup_date - INTERVAL '30 days';
    
    -- Permanently delete expired columns and their data
    IF v_expired_count > 0 THEN
        -- Delete expired data entries
        DELETE FROM data_entries 
        WHERE column_id IN (
            SELECT id FROM columns 
            WHERE status = 'deleted' 
            AND deleted_at < v_cleanup_date - INTERVAL '30 days'
        );
        
        -- Delete expired sector data entries
        DELETE FROM sector_data_entries 
        WHERE column_id IN (
            SELECT id FROM columns 
            WHERE status = 'deleted' 
            AND deleted_at < v_cleanup_date - INTERVAL '30 days'
        );
        
        -- Delete expired columns
        DELETE FROM columns 
        WHERE status = 'deleted' 
        AND deleted_at < v_cleanup_date - INTERVAL '30 days';
        
        -- Create audit log for cleanup
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, 
            old_value, new_value, created_at
        )
        VALUES (
            NULL, 'CLEANUP_EXPIRED_COLUMNS', 'columns', NULL,
            json_build_object(
                'expired_columns', v_expired_columns,
                'cleanup_count', v_expired_count
            ),
            json_build_object(
                'cleanup_date', v_cleanup_date,
                'retention_period', '30 days'
            ),
            v_cleanup_date
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'cleanup_date', v_cleanup_date,
        'expired_columns_found', v_expired_count,
        'expired_columns', v_expired_columns
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Cleanup failed: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore soft-deleted column function
CREATE OR REPLACE FUNCTION restore_deleted_column(
    p_column_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_user_role TEXT;
    v_column_info JSON;
    v_data_count INTEGER;
    v_sector_data_count INTEGER;
    v_restored_at TIMESTAMP WITH TIME ZONE;
BEGIN
    v_restored_at := NOW();
    
    -- Check user permissions
    SELECT role INTO v_user_role 
    FROM user_roles 
    WHERE user_id = p_user_id;
    
    IF v_user_role NOT IN ('superadmin', 'regionadmin') THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Insufficient permissions to restore columns'
        );
    END IF;
    
    -- Get column info and verify it's soft-deleted
    SELECT json_build_object(
        'id', id,
        'name', name,
        'type', type,
        'status', status,
        'deleted_at', deleted_at
    )
    INTO v_column_info
    FROM columns
    WHERE id = p_column_id AND status = 'deleted' AND deleted_at IS NOT NULL;
    
    IF v_column_info IS NULL THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Column not found or not eligible for restoration'
        );
    END IF;
    
    -- Check if restoration deadline has passed
    IF EXISTS (
        SELECT 1 FROM columns 
        WHERE id = p_column_id 
        AND deleted_at < v_restored_at - INTERVAL '30 days'
    ) THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Restoration deadline has passed (30 days)'
        );
    END IF;
    
    -- Restore the column
    UPDATE columns 
    SET 
        status = 'active',
        deleted_at = NULL,
        deleted_by = NULL
    WHERE id = p_column_id;
    
    -- Restore associated data
    UPDATE data_entries 
    SET deleted_at = NULL
    WHERE column_id = p_column_id AND deleted_at IS NOT NULL;
    
    UPDATE sector_data_entries 
    SET deleted_at = NULL
    WHERE column_id = p_column_id AND deleted_at IS NOT NULL;
    
    -- Count restored records
    SELECT COUNT(*) INTO v_data_count 
    FROM data_entries WHERE column_id = p_column_id;
    
    SELECT COUNT(*) INTO v_sector_data_count 
    FROM sector_data_entries WHERE column_id = p_column_id;
    
    -- Create audit log
    INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, 
        old_value, new_value, created_at
    )
    VALUES (
        p_user_id, 'RESTORE_COLUMN', 'columns', p_column_id,
        v_column_info,
        json_build_object(
            'restored_at', v_restored_at,
            'restored_records', json_build_object(
                'data_entries', v_data_count,
                'sector_entries', v_sector_data_count
            )
        ),
        v_restored_at
    );
    
    RETURN json_build_object(
        'success', true,
        'restored_at', v_restored_at,
        'restored_records', json_build_object(
            'data_entries', v_data_count,
            'sector_entries', v_sector_data_count
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Restoration failed: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add deleted_at and deleted_by columns if they don't exist
DO $$
BEGIN
    -- Add deleted_at column to columns table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'columns' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE columns ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add deleted_by column to columns table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'columns' AND column_name = 'deleted_by'
    ) THEN
        ALTER TABLE columns ADD COLUMN deleted_by UUID REFERENCES profiles(id);
    END IF;
    
    -- Add deleted_at column to data_entries table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'data_entries' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE data_entries ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add deleted_at column to sector_data_entries table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sector_data_entries' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE sector_data_entries ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;