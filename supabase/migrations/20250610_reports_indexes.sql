-- =============================================
-- Reports Performance Indexes (Separate Script)
-- Purpose: Create indexes to improve reports performance
-- Note: Run these separately after main functions
-- =============================================

-- Performance indexes for reports queries
-- These should be run individually in Supabase SQL Editor

-- Index 1: Data entries by school, category and status
DROP INDEX IF EXISTS idx_data_entries_school_category_status;
CREATE INDEX idx_data_entries_school_category_status 
  ON data_entries(school_id, category_id, status);

-- Index 2: Data entries by creation date (descending)
DROP INDEX IF EXISTS idx_data_entries_created_at_desc;
CREATE INDEX idx_data_entries_created_at_desc 
  ON data_entries(created_at DESC);

-- Index 3: Data entries by status and date
DROP INDEX IF EXISTS idx_data_entries_status_created_at;
CREATE INDEX idx_data_entries_status_created_at 
  ON data_entries(status, created_at DESC);

-- Index 4: Schools by region and sector (active only)
DROP INDEX IF EXISTS idx_schools_region_sector_active;
CREATE INDEX idx_schools_region_sector_active 
  ON schools(region_id, sector_id) WHERE status = 'active';

-- Index 5: Columns by category (active only)
DROP INDEX IF EXISTS idx_columns_category_active;
CREATE INDEX idx_columns_category_active 
  ON columns(category_id) WHERE status = 'active';

-- Index 6: Categories by status and priority
DROP INDEX IF EXISTS idx_categories_status_priority;
CREATE INDEX idx_categories_status_priority 
  ON categories(status, priority) WHERE status = 'active';

-- Additional useful indexes
DROP INDEX IF EXISTS idx_data_entries_column_school;
CREATE INDEX idx_data_entries_column_school 
  ON data_entries(column_id, school_id);

DROP INDEX IF EXISTS idx_schools_completion_rate;
CREATE INDEX idx_schools_completion_rate 
  ON schools(completion_rate DESC) WHERE status = 'active';

-- =============================================
-- END OF PERFORMANCE INDEXES
-- =============================================
