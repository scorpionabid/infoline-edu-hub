-- Excel Import/Export system database schema additions for InfoLine
-- These tables support comprehensive Excel import/export functionality

-- Excel import history tracking
CREATE TABLE IF NOT EXISTS excel_import_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    imported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('processing', 'completed', 'failed', 'partial')) DEFAULT 'processing',
    total_rows INTEGER DEFAULT 0,
    successful_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    error_log JSONB,
    processing_time_ms INTEGER,
    -- Additional metadata
    original_headers TEXT[],
    mapped_columns JSONB,
    validation_errors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bulk operation tracking (for both import and export operations)
CREATE TABLE IF NOT EXISTS bulk_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL CHECK (operation_type IN ('import', 'export', 'template_generation', 'validation')),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
    initiated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    items_total INTEGER DEFAULT 0,
    items_processed INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    result_summary JSONB,
    error_details JSONB,
    -- Additional tracking
    operation_params JSONB,
    estimated_completion_time TIMESTAMP WITH TIME ZONE,
    actual_duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_excel_import_history_school_category 
    ON excel_import_history(school_id, category_id);
    
CREATE INDEX IF NOT EXISTS idx_excel_import_history_status 
    ON excel_import_history(status);
    
CREATE INDEX IF NOT EXISTS idx_excel_import_history_imported_by 
    ON excel_import_history(imported_by);
    
CREATE INDEX IF NOT EXISTS idx_excel_import_history_created_at 
    ON excel_import_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bulk_operations_status 
    ON bulk_operations(status);
    
CREATE INDEX IF NOT EXISTS idx_bulk_operations_type_status 
    ON bulk_operations(operation_type, status);
    
CREATE INDEX IF NOT EXISTS idx_bulk_operations_initiated_by 
    ON bulk_operations(initiated_by);
    
CREATE INDEX IF NOT EXISTS idx_bulk_operations_created_at 
    ON bulk_operations(created_at DESC);

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_excel_import_history_updated_at ON excel_import_history;
CREATE TRIGGER update_excel_import_history_updated_at 
    BEFORE UPDATE ON excel_import_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bulk_operations_updated_at ON bulk_operations;
CREATE TRIGGER update_bulk_operations_updated_at 
    BEFORE UPDATE ON bulk_operations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for Excel tables
ALTER TABLE excel_import_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;

-- Excel import history policies
CREATE POLICY "SuperAdmin can access all excel import history" ON excel_import_history
    FOR ALL TO authenticated
    USING (is_superadmin());

CREATE POLICY "RegionAdmin can access own region excel import history" ON excel_import_history
    FOR ALL TO authenticated
    USING (
        has_access_to_region(auth.uid(), (
            SELECT region_id FROM schools WHERE id = excel_import_history.school_id
        ))
    );

CREATE POLICY "SectorAdmin can access own sector excel import history" ON excel_import_history
    FOR ALL TO authenticated
    USING (
        has_access_to_sector(auth.uid(), (
            SELECT sector_id FROM schools WHERE id = excel_import_history.school_id
        ))
    );

CREATE POLICY "SchoolAdmin can access own school excel import history" ON excel_import_history
    FOR ALL TO authenticated
    USING (has_access_to_school(auth.uid(), excel_import_history.school_id));

-- Bulk operations policies
CREATE POLICY "SuperAdmin can access all bulk operations" ON bulk_operations
    FOR ALL TO authenticated
    USING (is_superadmin());

CREATE POLICY "RegionAdmin can access own region bulk operations" ON bulk_operations
    FOR ALL TO authenticated
    USING (
        CASE 
            WHEN bulk_operations.region_id IS NOT NULL THEN
                has_access_to_region(auth.uid(), bulk_operations.region_id)
            WHEN bulk_operations.school_id IS NOT NULL THEN
                has_access_to_region(auth.uid(), (
                    SELECT region_id FROM schools WHERE id = bulk_operations.school_id
                ))
            ELSE FALSE
        END
    );

CREATE POLICY "SectorAdmin can access own sector bulk operations" ON bulk_operations
    FOR ALL TO authenticated
    USING (
        CASE 
            WHEN bulk_operations.sector_id IS NOT NULL THEN
                has_access_to_sector(auth.uid(), bulk_operations.sector_id)
            WHEN bulk_operations.school_id IS NOT NULL THEN
                has_access_to_sector(auth.uid(), (
                    SELECT sector_id FROM schools WHERE id = bulk_operations.school_id
                ))
            ELSE FALSE
        END
    );

CREATE POLICY "SchoolAdmin can access own school bulk operations" ON bulk_operations
    FOR ALL TO authenticated
    USING (has_access_to_school(auth.uid(), bulk_operations.school_id));

CREATE POLICY "Users can access own bulk operations" ON bulk_operations
    FOR ALL TO authenticated
    USING (bulk_operations.initiated_by = auth.uid());

-- Helper functions for Excel operations
CREATE OR REPLACE FUNCTION get_excel_import_stats(
    p_school_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_date_from TIMESTAMP DEFAULT NULL,
    p_date_to TIMESTAMP DEFAULT NULL
)
RETURNS TABLE(
    total_imports INTEGER,
    successful_imports INTEGER,
    failed_imports INTEGER,
    total_rows INTEGER,
    successful_rows INTEGER,
    failed_rows INTEGER,
    avg_processing_time_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_imports,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as successful_imports,
        COUNT(*) FILTER (WHERE status = 'failed')::INTEGER as failed_imports,
        COALESCE(SUM(eih.total_rows), 0)::INTEGER as total_rows,
        COALESCE(SUM(eih.successful_rows), 0)::INTEGER as successful_rows,
        COALESCE(SUM(eih.failed_rows), 0)::INTEGER as failed_rows,
        ROUND(AVG(eih.processing_time_ms), 2) as avg_processing_time_ms
    FROM excel_import_history eih
    WHERE (p_school_id IS NULL OR eih.school_id = p_school_id)
      AND (p_category_id IS NULL OR eih.category_id = p_category_id)
      AND (p_date_from IS NULL OR eih.created_at >= p_date_from)
      AND (p_date_to IS NULL OR eih.created_at <= p_date_to);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old import history (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_excel_import_history(
    p_days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM excel_import_history 
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE excel_import_history IS 'Tracks all Excel import operations with detailed metadata and error logging';
COMMENT ON TABLE bulk_operations IS 'Tracks all bulk operations including imports, exports, and template generation';
