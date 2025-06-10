-- =============================================
-- İnfoLine Reports Database Functions
-- Date: $(date)
-- Purpose: Real data integration for Reports system
-- =============================================

-- 1. SCHOOL PERFORMANCE REPORT FUNCTION
-- Gets comprehensive school performance data with completion rates, entry statistics
CREATE OR REPLACE FUNCTION get_school_performance_report(
  p_region_id uuid DEFAULT NULL,
  p_sector_id uuid DEFAULT NULL,
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL,
  p_category_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Check user access permissions
  IF NOT (
    is_superadmin() OR
    (p_region_id IS NOT NULL AND has_access_to_region(auth.uid(), p_region_id)) OR
    (p_sector_id IS NOT NULL AND has_access_to_sector(auth.uid(), p_sector_id))
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to access this data';
  END IF;

  SELECT json_agg(
    json_build_object(
      'school_id', s.id,
      'school_name', s.name,
      'principal_name', s.principal_name,
      'region_id', s.region_id,
      'region_name', r.name,
      'sector_id', s.sector_id,
      'sector_name', sec.name,
      'student_count', s.student_count,
      'teacher_count', s.teacher_count,
      'completion_rate', COALESCE(s.completion_rate, 0),
      'total_entries', COALESCE(entry_stats.total_entries, 0),
      'approved_entries', COALESCE(entry_stats.approved_entries, 0),
      'pending_entries', COALESCE(entry_stats.pending_entries, 0),
      'rejected_entries', COALESCE(entry_stats.rejected_entries, 0),
      'approval_rate', CASE 
        WHEN COALESCE(entry_stats.total_entries, 0) > 0 
        THEN ROUND((COALESCE(entry_stats.approved_entries, 0)::decimal / entry_stats.total_entries::decimal) * 100, 2)
        ELSE 0 
      END,
      'last_submission', entry_stats.last_submission,
      'categories_covered', COALESCE(entry_stats.categories_covered, 0),
      'phone', s.phone,
      'email', s.email,
      'address', s.address,
      'status', s.status
    )
  ) INTO v_result
  FROM schools s
  JOIN regions r ON s.region_id = r.id
  JOIN sectors sec ON s.sector_id = sec.id
  LEFT JOIN LATERAL (
    SELECT 
      COUNT(*)::integer as total_entries,
      COUNT(*) FILTER (WHERE de.status = 'approved')::integer as approved_entries,
      COUNT(*) FILTER (WHERE de.status = 'pending')::integer as pending_entries,
      COUNT(*) FILTER (WHERE de.status = 'rejected')::integer as rejected_entries,
      MAX(de.created_at) as last_submission,
      COUNT(DISTINCT de.category_id)::integer as categories_covered
    FROM data_entries de 
    WHERE de.school_id = s.id
      AND (p_date_from IS NULL OR de.created_at::date >= p_date_from)
      AND (p_date_to IS NULL OR de.created_at::date <= p_date_to)
      AND (p_category_id IS NULL OR de.category_id = p_category_id)
  ) entry_stats ON true
  WHERE 
    s.status = 'active'
    AND (p_region_id IS NULL OR s.region_id = p_region_id)
    AND (p_sector_id IS NULL OR s.sector_id = p_sector_id);

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- 2. REGIONAL COMPARISON REPORT FUNCTION
-- Compares performance metrics across regions
CREATE OR REPLACE FUNCTION get_regional_comparison_report(
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Check if user has access to view regional data
  IF NOT (is_superadmin() OR is_regionadmin()) THEN
    RAISE EXCEPTION 'Insufficient permissions to access regional comparison data';
  END IF;

  SELECT json_agg(
    json_build_object(
      'region_id', r.id,
      'region_name', r.name,
      'total_schools', regional_stats.total_schools,
      'active_schools', regional_stats.active_schools,
      'total_sectors', regional_stats.total_sectors,
      'total_students', regional_stats.total_students,
      'total_teachers', regional_stats.total_teachers,
      'avg_completion_rate', regional_stats.avg_completion_rate,
      'total_submissions', regional_stats.total_submissions,
      'approved_submissions', regional_stats.approved_submissions,
      'pending_submissions', regional_stats.pending_submissions,
      'rejected_submissions', regional_stats.rejected_submissions,
      'approval_rate', regional_stats.approval_rate,
      'schools_with_submissions', regional_stats.schools_with_submissions,
      'submission_rate', regional_stats.submission_rate
    )
  ) INTO v_result
  FROM regions r
  LEFT JOIN LATERAL (
    SELECT 
      COUNT(DISTINCT s.id)::integer as total_schools,
      COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active')::integer as active_schools,
      COUNT(DISTINCT s.sector_id)::integer as total_sectors,
      SUM(s.student_count)::integer as total_students,
      SUM(s.teacher_count)::integer as total_teachers,
      ROUND(AVG(s.completion_rate), 2) as avg_completion_rate,
      COUNT(de.id)::integer as total_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'approved')::integer as approved_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'pending')::integer as pending_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'rejected')::integer as rejected_submissions,
      CASE 
        WHEN COUNT(de.id) > 0 
        THEN ROUND((COUNT(de.id) FILTER (WHERE de.status = 'approved')::decimal / COUNT(de.id)::decimal) * 100, 2)
        ELSE 0 
      END as approval_rate,
      COUNT(DISTINCT de.school_id)::integer as schools_with_submissions,
      CASE 
        WHEN COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') > 0 
        THEN ROUND((COUNT(DISTINCT de.school_id)::decimal / COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active')::decimal) * 100, 2)
        ELSE 0 
      END as submission_rate
    FROM schools s
    LEFT JOIN data_entries de ON s.id = de.school_id
      AND (p_date_from IS NULL OR de.created_at::date >= p_date_from)
      AND (p_date_to IS NULL OR de.created_at::date <= p_date_to)
    WHERE s.region_id = r.id
  ) regional_stats ON true
  WHERE r.status = 'active'
  ORDER BY r.name;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- 3. CATEGORY COMPLETION REPORT FUNCTION
-- Shows completion status for each category across schools
CREATE OR REPLACE FUNCTION get_category_completion_report(
  p_region_id uuid DEFAULT NULL,
  p_sector_id uuid DEFAULT NULL,
  p_category_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Check user access permissions
  IF NOT (
    is_superadmin() OR
    (p_region_id IS NOT NULL AND has_access_to_region(auth.uid(), p_region_id)) OR
    (p_sector_id IS NOT NULL AND has_access_to_sector(auth.uid(), p_sector_id))
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to access this data';
  END IF;

  SELECT json_agg(
    json_build_object(
      'category_id', c.id,
      'category_name', c.name,
      'category_description', c.description,
      'assignment', c.assignment,
      'deadline', c.deadline,
      'total_columns', category_stats.total_columns,
      'required_columns', category_stats.required_columns,
      'schools_completed', category_stats.schools_completed,
      'schools_partial', category_stats.schools_partial,
      'schools_not_started', category_stats.schools_not_started,
      'total_schools', category_stats.total_schools,
      'completion_percentage', category_stats.completion_percentage,
      'total_submissions', category_stats.total_submissions,
      'approved_submissions', category_stats.approved_submissions,
      'pending_submissions', category_stats.pending_submissions,
      'avg_completion_time_days', category_stats.avg_completion_time_days
    )
  ) INTO v_result
  FROM categories c
  LEFT JOIN LATERAL (
    SELECT 
      COUNT(DISTINCT col.id)::integer as total_columns,
      COUNT(DISTINCT col.id) FILTER (WHERE col.is_required = true)::integer as required_columns,
      COUNT(DISTINCT s.id) FILTER (WHERE school_completion.completion_rate = 100)::integer as schools_completed,
      COUNT(DISTINCT s.id) FILTER (WHERE school_completion.completion_rate > 0 AND school_completion.completion_rate < 100)::integer as schools_partial,
      COUNT(DISTINCT s.id) FILTER (WHERE COALESCE(school_completion.completion_rate, 0) = 0)::integer as schools_not_started,
      COUNT(DISTINCT s.id)::integer as total_schools,
      ROUND(AVG(COALESCE(school_completion.completion_rate, 0)), 2) as completion_percentage,
      COUNT(de.id)::integer as total_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'approved')::integer as approved_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'pending')::integer as pending_submissions,
      ROUND(AVG(EXTRACT(EPOCH FROM (de.updated_at - de.created_at)) / 86400), 1) as avg_completion_time_days
    FROM schools s
    LEFT JOIN columns col ON col.category_id = c.id AND col.status = 'active'
    LEFT JOIN data_entries de ON de.school_id = s.id AND de.category_id = c.id
    LEFT JOIN LATERAL (
      SELECT 
        CASE 
          WHEN COUNT(DISTINCT col_req.id) > 0 
          THEN ROUND((COUNT(DISTINCT de_school.column_id)::decimal / COUNT(DISTINCT col_req.id)::decimal) * 100, 2)
          ELSE 0 
        END as completion_rate
      FROM columns col_req
      LEFT JOIN data_entries de_school ON de_school.column_id = col_req.id 
        AND de_school.school_id = s.id 
        AND de_school.status = 'approved'
      WHERE col_req.category_id = c.id 
        AND col_req.is_required = true 
        AND col_req.status = 'active'
    ) school_completion ON true
    WHERE s.status = 'active'
      AND (p_region_id IS NULL OR s.region_id = p_region_id)
      AND (p_sector_id IS NULL OR s.sector_id = p_sector_id)
  ) category_stats ON true
  WHERE c.status = 'active'
    AND (p_category_id IS NULL OR c.id = p_category_id)
  ORDER BY c.priority, c.name;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- 4. SCHOOL DATA BY CATEGORY FUNCTION
-- Gets detailed data for a specific school and category (for SchoolColumnTable)
CREATE OR REPLACE FUNCTION get_school_data_by_category(
  p_school_id uuid,
  p_category_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Check if user has access to this school
  IF NOT has_access_to_school(auth.uid(), p_school_id) THEN
    RAISE EXCEPTION 'Insufficient permissions to access this school data';
  END IF;

  SELECT json_agg(
    json_build_object(
      'column_id', col.id,
      'column_name', col.name,
      'column_type', col.type,
      'is_required', col.is_required,
      'order_index', col.order_index,
      'placeholder', col.placeholder,
      'help_text', col.help_text,
      'options', col.options,
      'validation', col.validation,
      'value', de.value,
      'status', COALESCE(de.status, 'not_filled'),
      'created_at', de.created_at,
      'updated_at', de.updated_at,
      'created_by', de.created_by,
      'approved_by', de.approved_by,
      'approved_at', de.approved_at,
      'rejected_by', de.rejected_by,
      'rejection_reason', de.rejection_reason
    )
    ORDER BY col.order_index, col.name
  ) INTO v_result
  FROM columns col
  LEFT JOIN data_entries de ON de.column_id = col.id 
    AND de.school_id = p_school_id 
    AND de.category_id = p_category_id
  WHERE col.category_id = p_category_id
    AND col.status = 'active'
  ORDER BY col.order_index, col.name;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- 5. DASHBOARD STATISTICS FUNCTION
-- Gets summary statistics for dashboard widgets
CREATE OR REPLACE FUNCTION get_dashboard_statistics(
  p_region_id uuid DEFAULT NULL,
  p_sector_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
  v_user_role text;
  v_user_region_id uuid;
  v_user_sector_id uuid;
  v_user_school_id uuid;
BEGIN
  -- Get user role and associated IDs
  SELECT role, region_id, sector_id, school_id
  INTO v_user_role, v_user_region_id, v_user_sector_id, v_user_school_id
  FROM user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;

  -- Apply role-based filtering
  IF v_user_role = 'regionadmin' THEN
    p_region_id := v_user_region_id;
  ELSIF v_user_role = 'sectoradmin' THEN
    p_sector_id := v_user_sector_id;
  ELSIF v_user_role = 'schooladmin' THEN
    -- For school admin, return only their school's data
    SELECT json_build_object(
      'total_schools', 1,
      'active_schools', CASE WHEN s.status = 'active' THEN 1 ELSE 0 END,
      'total_students', COALESCE(s.student_count, 0),
      'total_teachers', COALESCE(s.teacher_count, 0),
      'completion_rate', COALESCE(s.completion_rate, 0),
      'total_categories', (SELECT COUNT(*) FROM categories WHERE status = 'active'),
      'completed_categories', (
        SELECT COUNT(DISTINCT de.category_id) 
        FROM data_entries de 
        WHERE de.school_id = v_user_school_id AND de.status = 'approved'
      ),
      'pending_submissions', (
        SELECT COUNT(*) 
        FROM data_entries de 
        WHERE de.school_id = v_user_school_id AND de.status = 'pending'
      ),
      'recent_activities', (
        SELECT json_agg(
          json_build_object(
            'action', 'Data submitted',
            'category', c.name,
            'timestamp', de.created_at
          )
        )
        FROM data_entries de
        JOIN categories c ON c.id = de.category_id
        WHERE de.school_id = v_user_school_id
        ORDER BY de.created_at DESC
        LIMIT 5
      )
    ) INTO v_result
    FROM schools s
    WHERE s.id = v_user_school_id;
    
    RETURN v_result;
  END IF;

  -- For superadmin, regionadmin, sectoradmin
  SELECT json_build_object(
    'total_schools', stats.total_schools,
    'active_schools', stats.active_schools,
    'total_regions', stats.total_regions,
    'total_sectors', stats.total_sectors,
    'total_students', stats.total_students,
    'total_teachers', stats.total_teachers,
    'avg_completion_rate', stats.avg_completion_rate,
    'total_submissions', stats.total_submissions,
    'approved_submissions', stats.approved_submissions,
    'pending_submissions', stats.pending_submissions,
    'rejected_submissions', stats.rejected_submissions,
    'approval_rate', stats.approval_rate,
    'schools_with_high_completion', stats.schools_with_high_completion,
    'schools_needing_attention', stats.schools_needing_attention,
    'categories_overview', stats.categories_overview,
    'recent_activities', stats.recent_activities,
    'top_performing_schools', stats.top_performing_schools,
    'submission_trends', stats.submission_trends
  ) INTO v_result
  FROM (
    SELECT 
      COUNT(DISTINCT s.id)::integer as total_schools,
      COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active')::integer as active_schools,
      COUNT(DISTINCT s.region_id)::integer as total_regions,
      COUNT(DISTINCT s.sector_id)::integer as total_sectors,
      SUM(s.student_count)::integer as total_students,
      SUM(s.teacher_count)::integer as total_teachers,
      ROUND(AVG(s.completion_rate), 2) as avg_completion_rate,
      COUNT(de.id)::integer as total_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'approved')::integer as approved_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'pending')::integer as pending_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'rejected')::integer as rejected_submissions,
      CASE 
        WHEN COUNT(de.id) > 0 
        THEN ROUND((COUNT(de.id) FILTER (WHERE de.status = 'approved')::decimal / COUNT(de.id)::decimal) * 100, 2)
        ELSE 0 
      END as approval_rate,
      COUNT(DISTINCT s.id) FILTER (WHERE s.completion_rate >= 80)::integer as schools_with_high_completion,
      COUNT(DISTINCT s.id) FILTER (WHERE s.completion_rate < 50)::integer as schools_needing_attention,
      (
        SELECT json_agg(
          json_build_object(
            'name', c.name,
            'total_schools_assigned', assigned_count,
            'completed_schools', completed_count,
            'completion_percentage', 
            CASE 
              WHEN assigned_count > 0 
              THEN ROUND((completed_count::decimal / assigned_count::decimal) * 100, 2)
              ELSE 0 
            END
          )
        )
        FROM categories c
        LEFT JOIN LATERAL (
          SELECT 
            COUNT(DISTINCT s_cat.id) as assigned_count,
            COUNT(DISTINCT s_cat.id) FILTER (
              WHERE EXISTS (
                SELECT 1 FROM data_entries de_cat 
                WHERE de_cat.school_id = s_cat.id 
                  AND de_cat.category_id = c.id 
                  AND de_cat.status = 'approved'
              )
            ) as completed_count
          FROM schools s_cat
          WHERE s_cat.status = 'active'
            AND (p_region_id IS NULL OR s_cat.region_id = p_region_id)
            AND (p_sector_id IS NULL OR s_cat.sector_id = p_sector_id)
        ) cat_stats ON true
        WHERE c.status = 'active'
        ORDER BY c.priority, c.name
      ) as categories_overview,
      (
        SELECT json_agg(
          json_build_object(
            'school_name', s_act.name,
            'action', 'Data submission',
            'category', c_act.name,
            'status', de_act.status,
            'timestamp', de_act.created_at
          )
        )
        FROM data_entries de_act
        JOIN schools s_act ON s_act.id = de_act.school_id
        JOIN categories c_act ON c_act.id = de_act.category_id
        WHERE (p_region_id IS NULL OR s_act.region_id = p_region_id)
          AND (p_sector_id IS NULL OR s_act.sector_id = p_sector_id)
        ORDER BY de_act.created_at DESC
        LIMIT 10
      ) as recent_activities,
      (
        SELECT json_agg(
          json_build_object(
            'school_name', s_top.name,
            'completion_rate', s_top.completion_rate,
            'total_submissions', s_top.submission_count
          )
        )
        FROM (
          SELECT 
            s_perf.name,
            s_perf.completion_rate,
            COUNT(de_perf.id) as submission_count
          FROM schools s_perf
          LEFT JOIN data_entries de_perf ON de_perf.school_id = s_perf.id
          WHERE s_perf.status = 'active'
            AND (p_region_id IS NULL OR s_perf.region_id = p_region_id)
            AND (p_sector_id IS NULL OR s_perf.sector_id = p_sector_id)
          GROUP BY s_perf.id, s_perf.name, s_perf.completion_rate
          ORDER BY s_perf.completion_rate DESC, submission_count DESC
          LIMIT 5
        ) s_top
      ) as top_performing_schools,
      (
        SELECT json_agg(
          json_build_object(
            'date', trend_date,
            'submissions', submission_count,
            'approvals', approval_count
          )
        )
        FROM (
          SELECT 
            de_trend.created_at::date as trend_date,
            COUNT(*) as submission_count,
            COUNT(*) FILTER (WHERE de_trend.status = 'approved') as approval_count
          FROM data_entries de_trend
          JOIN schools s_trend ON s_trend.id = de_trend.school_id
          WHERE de_trend.created_at >= CURRENT_DATE - INTERVAL '30 days'
            AND (p_region_id IS NULL OR s_trend.region_id = p_region_id)
            AND (p_sector_id IS NULL OR s_trend.sector_id = p_sector_id)
          GROUP BY de_trend.created_at::date
          ORDER BY trend_date DESC
          LIMIT 30
        ) trends
      ) as submission_trends
    FROM schools s
    LEFT JOIN data_entries de ON de.school_id = s.id
    WHERE s.status = 'active'
      AND (p_region_id IS NULL OR s.region_id = p_region_id)
      AND (p_sector_id IS NULL OR s.sector_id = p_sector_id)
  ) stats;

  RETURN COALESCE(v_result, '{}'::json);
END;
$$;

-- 6. CREATE REQUIRED INDEXES FOR PERFORMANCE
-- These indexes will improve query performance for reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_data_entries_school_category_status 
  ON data_entries(school_id, category_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_data_entries_created_at_desc 
  ON data_entries(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_data_entries_status_created_at 
  ON data_entries(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_schools_region_sector_active 
  ON schools(region_id, sector_id) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_columns_category_active 
  ON columns(category_id) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_status_priority 
  ON categories(status, priority) WHERE status = 'active';

-- 7. GRANT PERMISSIONS
-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_school_performance_report TO authenticated;
GRANT EXECUTE ON FUNCTION get_regional_comparison_report TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_completion_report TO authenticated;
GRANT EXECUTE ON FUNCTION get_school_data_by_category TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_statistics TO authenticated;

-- Create comment for documentation
COMMENT ON FUNCTION get_school_performance_report IS 'Returns comprehensive school performance data with role-based access control';
COMMENT ON FUNCTION get_regional_comparison_report IS 'Returns regional comparison statistics (admin+ access required)';
COMMENT ON FUNCTION get_category_completion_report IS 'Returns category completion status across schools with role-based filtering';
COMMENT ON FUNCTION get_school_data_by_category IS 'Returns detailed school data for specific category (school access required)';
COMMENT ON FUNCTION get_dashboard_statistics IS 'Returns dashboard statistics with role-based data filtering';

-- =============================================
-- END OF REPORTS DATABASE FUNCTIONS
-- =============================================
