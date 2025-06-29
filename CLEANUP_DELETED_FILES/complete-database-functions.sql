-- İnfoLine Reports - Complete Database Functions
-- Bu faylı Supabase SQL Editor-də icra edin

-- Əvvəlcə mövcud funksiyaları siləcəyik
DROP FUNCTION IF EXISTS get_school_performance_report;
DROP FUNCTION IF EXISTS get_regional_comparison_report;
DROP FUNCTION IF EXISTS get_category_completion_report;
DROP FUNCTION IF EXISTS get_school_data_by_category;
DROP FUNCTION IF EXISTS get_dashboard_statistics;

-- 1. get_school_performance_report (ƏSA FUNKSİYA)
CREATE OR REPLACE FUNCTION get_school_performance_report(
  p_region_id uuid DEFAULT NULL,
  p_sector_id uuid DEFAULT NULL,
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL,
  p_category_id uuid DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  WITH school_data AS (
    SELECT 
      s.id as school_id,
      s.name as school_name,
      s.principal_name,
      s.address,
      s.phone,
      s.email,
      s.student_count,
      s.teacher_count,
      r.id as region_id,
      r.name as region_name,
      sec.id as sector_id,
      sec.name as sector_name,
      COALESCE(s.completion_rate, 0) as completion_rate,
      COALESCE(entry_stats.total_entries, 0) as total_entries,
      COALESCE(entry_stats.approved_entries, 0) as approved_entries,
      COALESCE(entry_stats.pending_entries, 0) as pending_entries,
      COALESCE(entry_stats.rejected_entries, 0) as rejected_entries,
      CASE 
        WHEN COALESCE(entry_stats.total_entries, 0) > 0 
        THEN ROUND((COALESCE(entry_stats.approved_entries, 0)::numeric / entry_stats.total_entries::numeric) * 100)
        ELSE 0 
      END as approval_rate,
      entry_stats.last_submission,
      COALESCE(category_stats.categories_covered, 0) as categories_covered,
      s.status
    FROM schools s
    JOIN regions r ON s.region_id = r.id
    JOIN sectors sec ON s.sector_id = sec.id
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(*) as total_entries,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_entries,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_entries,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_entries,
        MAX(created_at) as last_submission
      FROM data_entries de 
      WHERE de.school_id = s.id
        AND (p_category_id IS NULL OR de.category_id = p_category_id)
        AND (p_date_from IS NULL OR de.created_at >= p_date_from)
        AND (p_date_to IS NULL OR de.created_at <= p_date_to)
    ) entry_stats ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(DISTINCT de.category_id) as categories_covered
      FROM data_entries de 
      WHERE de.school_id = s.id
        AND de.status = 'approved'
    ) category_stats ON true
    WHERE 
      (s.status = 'active' OR s.status IS NULL)
      AND (p_region_id IS NULL OR s.region_id = p_region_id)
      AND (p_sector_id IS NULL OR s.sector_id = p_sector_id)
  )
  SELECT json_agg(
    json_build_object(
      'school_id', school_id,
      'school_name', school_name,
      'principal_name', principal_name,
      'address', address,
      'phone', phone,
      'email', email,
      'student_count', student_count,
      'teacher_count', teacher_count,
      'region_id', region_id,
      'region_name', region_name,
      'sector_id', sector_id,
      'sector_name', sector_name,
      'completion_rate', completion_rate,
      'total_entries', total_entries,
      'approved_entries', approved_entries,
      'pending_entries', pending_entries,
      'rejected_entries', rejected_entries,
      'approval_rate', approval_rate,
      'last_submission', last_submission,
      'categories_covered', categories_covered,
      'status', status
    )
  ) INTO result
  FROM school_data;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. get_regional_comparison_report
CREATE OR REPLACE FUNCTION get_regional_comparison_report(
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL
)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'region_id', r.id,
        'region_name', r.name,
        'total_schools', COALESCE(region_stats.total_schools, 0),
        'active_schools', COALESCE(region_stats.active_schools, 0),
        'total_sectors', COALESCE(region_stats.total_sectors, 0),
        'total_students', COALESCE(region_stats.total_students, 0),
        'total_teachers', COALESCE(region_stats.total_teachers, 0),
        'avg_completion_rate', COALESCE(region_stats.avg_completion_rate, 0),
        'total_submissions', COALESCE(region_stats.total_submissions, 0),
        'approved_submissions', COALESCE(region_stats.approved_submissions, 0),
        'pending_submissions', COALESCE(region_stats.pending_submissions, 0),
        'rejected_submissions', COALESCE(region_stats.rejected_submissions, 0),
        'approval_rate', CASE 
          WHEN COALESCE(region_stats.total_submissions, 0) > 0 
          THEN ROUND((COALESCE(region_stats.approved_submissions, 0)::numeric / region_stats.total_submissions::numeric) * 100)
          ELSE 0 
        END,
        'schools_with_submissions', COALESCE(region_stats.schools_with_submissions, 0),
        'submission_rate', CASE 
          WHEN COALESCE(region_stats.total_schools, 0) > 0 
          THEN ROUND((COALESCE(region_stats.schools_with_submissions, 0)::numeric / region_stats.total_schools::numeric) * 100)
          ELSE 0 
        END
      )
    )
    FROM regions r
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(DISTINCT s.id) as total_schools,
        COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') as active_schools,
        COUNT(DISTINCT s.sector_id) as total_sectors,
        SUM(COALESCE(s.student_count, 0)) as total_students,
        SUM(COALESCE(s.teacher_count, 0)) as total_teachers,
        ROUND(AVG(COALESCE(s.completion_rate, 0))) as avg_completion_rate,
        COUNT(de.id) as total_submissions,
        COUNT(de.id) FILTER (WHERE de.status = 'approved') as approved_submissions,
        COUNT(de.id) FILTER (WHERE de.status = 'pending') as pending_submissions,
        COUNT(de.id) FILTER (WHERE de.status = 'rejected') as rejected_submissions,
        COUNT(DISTINCT de.school_id) as schools_with_submissions
      FROM schools s
      LEFT JOIN data_entries de ON de.school_id = s.id
        AND (p_date_from IS NULL OR de.created_at >= p_date_from)
        AND (p_date_to IS NULL OR de.created_at <= p_date_to)
      WHERE s.region_id = r.id 
    ) region_stats ON true
    WHERE (r.status = 'active' OR r.status IS NULL)
    ORDER BY region_stats.avg_completion_rate DESC NULLS LAST
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. get_category_completion_report
CREATE OR REPLACE FUNCTION get_category_completion_report(
  p_region_id uuid DEFAULT NULL,
  p_sector_id uuid DEFAULT NULL,
  p_category_id uuid DEFAULT NULL
)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'category_id', cat.id,
        'category_name', cat.name,
        'category_description', cat.description,
        'assignment', cat.assignment,
        'deadline', cat.deadline,
        'total_columns', COALESCE(cat_stats.total_columns, 0),
        'required_columns', COALESCE(cat_stats.required_columns, 0),
        'schools_completed', COALESCE(completion_stats.schools_completed, 0),
        'schools_partial', COALESCE(completion_stats.schools_partial, 0),
        'schools_not_started', COALESCE(completion_stats.schools_not_started, 0),
        'total_schools', COALESCE(completion_stats.total_schools, 0),
        'completion_percentage', CASE 
          WHEN COALESCE(completion_stats.total_schools, 0) > 0 
          THEN ROUND((COALESCE(completion_stats.schools_completed, 0)::numeric / completion_stats.total_schools::numeric) * 100)
          ELSE 0 
        END,
        'total_submissions', COALESCE(submission_stats.total_submissions, 0),
        'approved_submissions', COALESCE(submission_stats.approved_submissions, 0),
        'pending_submissions', COALESCE(submission_stats.pending_submissions, 0)
      )
    )
    FROM categories cat
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(*) as total_columns,
        COUNT(*) FILTER (WHERE is_required = true) as required_columns
      FROM columns c 
      WHERE c.category_id = cat.id 
        AND (c.status = 'active' OR c.status IS NULL)
    ) cat_stats ON true
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(DISTINCT s.id) as total_schools,
        COUNT(DISTINCT s.id) FILTER (WHERE school_completion.completion_rate >= 100) as schools_completed,
        COUNT(DISTINCT s.id) FILTER (WHERE school_completion.completion_rate > 0 AND school_completion.completion_rate < 100) as schools_partial,
        COUNT(DISTINCT s.id) FILTER (WHERE COALESCE(school_completion.completion_rate, 0) = 0) as schools_not_started
      FROM schools s
      LEFT JOIN LATERAL (
        SELECT 
          CASE 
            WHEN cat_stats.required_columns > 0 
            THEN ROUND((COUNT(DISTINCT de.column_id)::numeric / cat_stats.required_columns::numeric) * 100)
            ELSE 0 
          END as completion_rate
        FROM data_entries de 
        JOIN columns c ON de.column_id = c.id
        WHERE de.school_id = s.id 
          AND c.category_id = cat.id
          AND de.status = 'approved'
      ) school_completion ON true
      WHERE 
        (p_region_id IS NULL OR s.region_id = p_region_id)
        AND (p_sector_id IS NULL OR s.sector_id = p_sector_id)
        AND (s.status = 'active' OR s.status IS NULL)
    ) completion_stats ON true
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(*) FILTER (WHERE de.status = 'approved') as approved_submissions,
        COUNT(*) FILTER (WHERE de.status = 'pending') as pending_submissions
      FROM data_entries de 
      JOIN columns c ON de.column_id = c.id
      JOIN schools s ON de.school_id = s.id
      WHERE c.category_id = cat.id
        AND (p_region_id IS NULL OR s.region_id = p_region_id)
        AND (p_sector_id IS NULL OR s.sector_id = p_sector_id)
    ) submission_stats ON true
    WHERE 
      (cat.status = 'active' OR cat.status IS NULL)
      AND (p_category_id IS NULL OR cat.id = p_category_id)
    ORDER BY cat.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. get_school_data_by_category
CREATE OR REPLACE FUNCTION get_school_data_by_category(
  p_school_id uuid,
  p_category_id uuid
)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'column_id', c.id,
        'column_name', c.name,
        'column_type', c.type,
        'is_required', c.is_required,
        'order_index', c.order_index,
        'placeholder', c.placeholder,
        'help_text', c.help_text,
        'options', c.options,
        'validation', c.validation,
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
      ORDER BY c.order_index, c.name
    )
    FROM columns c
    LEFT JOIN data_entries de ON de.column_id = c.id AND de.school_id = p_school_id
    WHERE c.category_id = p_category_id
      AND (c.status = 'active' OR c.status IS NULL)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. get_dashboard_statistics
CREATE OR REPLACE FUNCTION get_dashboard_statistics(
  p_region_id uuid DEFAULT NULL,
  p_sector_id uuid DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  WITH stats AS (
    SELECT 
      COUNT(DISTINCT s.id) as total_schools,
      COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') as active_schools,
      COUNT(DISTINCT r.id) as total_regions,
      COUNT(DISTINCT sec.id) as total_sectors,
      SUM(COALESCE(s.student_count, 0)) as total_students,
      SUM(COALESCE(s.teacher_count, 0)) as total_teachers,
      ROUND(AVG(COALESCE(s.completion_rate, 0))) as avg_completion_rate,
      COUNT(de.id) as total_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'approved') as approved_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'pending') as pending_submissions,
      COUNT(de.id) FILTER (WHERE de.status = 'rejected') as rejected_submissions,
      COUNT(DISTINCT s.id) FILTER (WHERE s.completion_rate >= 80) as schools_with_high_completion,
      COUNT(DISTINCT s.id) FILTER (WHERE s.completion_rate < 50) as schools_needing_attention,
      COUNT(DISTINCT cat.id) as total_categories,
      COUNT(DISTINCT cat.id) FILTER (WHERE cat.status = 'active') as completed_categories
    FROM schools s
    LEFT JOIN regions r ON s.region_id = r.id
    LEFT JOIN sectors sec ON s.sector_id = sec.id
    LEFT JOIN data_entries de ON de.school_id = s.id
    LEFT JOIN categories cat ON de.category_id = cat.id
    WHERE 
      (p_region_id IS NULL OR s.region_id = p_region_id)
      AND (p_sector_id IS NULL OR s.sector_id = p_sector_id)
  ),
  recent_activities AS (
    SELECT json_agg(
      json_build_object(
        'school_name', s.name,
        'action', CASE 
          WHEN de.status = 'approved' THEN 'approved'
          WHEN de.status = 'rejected' THEN 'rejected'
          ELSE 'submitted'
        END,
        'category', cat.name,
        'status', de.status,
        'timestamp', de.updated_at
      )
      ORDER BY de.updated_at DESC
      LIMIT 10
    ) as activities
    FROM data_entries de
    JOIN schools s ON de.school_id = s.id
    JOIN categories cat ON de.category_id = cat.id
    WHERE 
      (p_region_id IS NULL OR s.region_id = p_region_id)
      AND (p_sector_id IS NULL OR s.sector_id = p_sector_id)
      AND de.updated_at >= NOW() - INTERVAL '30 days'
  ),
  top_schools AS (
    SELECT json_agg(
      json_build_object(
        'school_name', s.name,
        'completion_rate', s.completion_rate,
        'total_submissions', submission_count.total
      )
      ORDER BY s.completion_rate DESC
      LIMIT 5
    ) as top_performing_schools
    FROM schools s
    LEFT JOIN LATERAL (
      SELECT COUNT(*) as total
      FROM data_entries de 
      WHERE de.school_id = s.id AND de.status = 'approved'
    ) submission_count ON true
    WHERE 
      (p_region_id IS NULL OR s.region_id = p_region_id)
      AND (p_sector_id IS NULL OR s.sector_id = p_sector_id)
      AND (s.status = 'active' OR s.status IS NULL)
  )
  SELECT json_build_object(
    'total_schools', stats.total_schools,
    'active_schools', stats.active_schools,
    'total_regions', CASE WHEN p_region_id IS NULL THEN stats.total_regions ELSE NULL END,
    'total_sectors', CASE WHEN p_sector_id IS NULL THEN stats.total_sectors ELSE NULL END,
    'total_students', stats.total_students,
    'total_teachers', stats.total_teachers,
    'avg_completion_rate', stats.avg_completion_rate,
    'completion_rate', CASE WHEN p_region_id IS NOT NULL OR p_sector_id IS NOT NULL THEN stats.avg_completion_rate ELSE NULL END,
    'total_submissions', stats.total_submissions,
    'approved_submissions', stats.approved_submissions,
    'pending_submissions', stats.pending_submissions,
    'rejected_submissions', stats.rejected_submissions,
    'approval_rate', CASE 
      WHEN stats.total_submissions > 0 
      THEN ROUND((stats.approved_submissions::numeric / stats.total_submissions::numeric) * 100)
      ELSE 0 
    END,
    'schools_with_high_completion', stats.schools_with_high_completion,
    'schools_needing_attention', stats.schools_needing_attention,
    'total_categories', stats.total_categories,
    'completed_categories', stats.completed_categories,
    'recent_activities', recent_activities.activities,
    'top_performing_schools', top_schools.top_performing_schools
  ) INTO result
  FROM stats, recent_activities, top_schools;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions
GRANT EXECUTE ON FUNCTION get_school_performance_report TO authenticated;
GRANT EXECUTE ON FUNCTION get_regional_comparison_report TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_completion_report TO authenticated;
GRANT EXECUTE ON FUNCTION get_school_data_by_category TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_statistics TO authenticated;

-- Comments
COMMENT ON FUNCTION get_school_performance_report IS 'Məktəb performans hesabatı - əsas funksiya';
COMMENT ON FUNCTION get_regional_comparison_report IS 'Regional müqayisə hesabatı';
COMMENT ON FUNCTION get_category_completion_report IS 'Kateqoriya tamamlanma hesabatı';
COMMENT ON FUNCTION get_school_data_by_category IS 'Məktəbin kateqoriya üzrə məlumatları';
COMMENT ON FUNCTION get_dashboard_statistics IS 'Dashboard statistikaları';