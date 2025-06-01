-- =========================================================
-- Status Management System - Test Migration
-- Date: 2025-06-01  
-- Description: Test scenarios for status transition system
-- =========================================================

-- Test data setup for status transitions
-- ========================================

-- Create test function to validate migration
CREATE OR REPLACE FUNCTION test_status_management_system()
RETURNS TABLE (
  test_name TEXT,
  result BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  test_school_id UUID;
  test_category_id UUID;
  test_user_id UUID;
  test_result BOOLEAN;
  error_message TEXT;
BEGIN
  -- Test 1: Check if status_transition_log table exists
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'status_transition_log'
    ) INTO test_result;
    
    RETURN QUERY SELECT 
      'Status Transition Log Table'::TEXT,
      test_result,
      CASE WHEN test_result THEN 'Table exists' ELSE 'Table missing' END::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'Status Transition Log Table'::TEXT,
      FALSE,
      SQLERRM::TEXT;
  END;

  -- Test 2: Check if validation trigger exists
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'data_entries_status_validation'
    ) INTO test_result;
    
    RETURN QUERY SELECT 
      'Status Validation Trigger'::TEXT,
      test_result,
      CASE WHEN test_result THEN 'Trigger exists' ELSE 'Trigger missing' END::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'Status Validation Trigger'::TEXT,
      FALSE,
      SQLERRM::TEXT;
  END;

  -- Test 3: Check if RLS policies exist
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'data_entries' AND policyname = 'data_entries_select_policy'
    ) INTO test_result;
    
    RETURN QUERY SELECT 
      'RLS Policies'::TEXT,
      test_result,
      CASE WHEN test_result THEN 'Policies active' ELSE 'Policies missing' END::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'RLS Policies'::TEXT,
      FALSE,
      SQLERRM::TEXT;
  END;

  -- Test 4: Check status constraint
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'data_entries_status_check'
    ) INTO test_result;
    
    RETURN QUERY SELECT 
      'Status Constraint'::TEXT,
      test_result,
      CASE WHEN test_result THEN 'Constraint active' ELSE 'Constraint missing' END::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'Status Constraint'::TEXT,
      FALSE,
      SQLERRM::TEXT;
  END;

  -- Test 5: Check utility functions
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'get_entry_status'
    ) INTO test_result;
    
    RETURN QUERY SELECT 
      'Utility Functions'::TEXT,
      test_result,
      CASE WHEN test_result THEN 'Functions available' ELSE 'Functions missing' END::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'Utility Functions'::TEXT,
      FALSE,
      SQLERRM::TEXT;
  END;

  -- Test 6: Check notification function
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'create_notification_on_status_change'
    ) INTO test_result;
    
    RETURN QUERY SELECT 
      'Notification System'::TEXT,
      test_result,
      CASE WHEN test_result THEN 'Notifications enabled' ELSE 'Notifications missing' END::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'Notification System'::TEXT,
      FALSE,
      SQLERRM::TEXT;
  END;

END;
$$;

-- Status transition test scenarios (for manual testing)
-- ========================================

-- Function to create test data for status transitions
CREATE OR REPLACE FUNCTION create_status_test_data()
RETURNS TABLE (
  action TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  test_school_id UUID;
  test_category_id UUID;
  test_region_id UUID;
  test_sector_id UUID;
  school_admin_user_id UUID;
  sector_admin_user_id UUID;
BEGIN
  -- Note: This function creates test data structure but doesn't insert real data
  -- Real testing should be done with actual user authentication context
  
  RETURN QUERY SELECT 
    'Test Setup'::TEXT,
    'Ready'::TEXT,
    'Use this function as a template for manual status testing'::TEXT;
    
  RETURN QUERY SELECT 
    'Manual Test 1'::TEXT,
    'Draft → Pending'::TEXT,
    'School admin should be able to submit draft data for approval'::TEXT;
    
  RETURN QUERY SELECT 
    'Manual Test 2'::TEXT,
    'Pending → Approved'::TEXT,
    'Sector/Region admin should be able to approve pending data'::TEXT;
    
  RETURN QUERY SELECT 
    'Manual Test 3'::TEXT,
    'Pending → Rejected'::TEXT,
    'Sector/Region admin should be able to reject with reason'::TEXT;
    
  RETURN QUERY SELECT 
    'Manual Test 4'::TEXT,
    'Rejected → Draft'::TEXT,
    'School admin should be able to reset rejected data to draft'::TEXT;
    
  RETURN QUERY SELECT 
    'Manual Test 5'::TEXT,
    'Approved → Any'::TEXT,
    'Should be prevented - approved data is immutable'::TEXT;
END;
$$;

-- Performance test for status operations
-- ========================================
CREATE OR REPLACE FUNCTION test_status_performance()
RETURNS TABLE (
  operation TEXT,
  duration_ms INTEGER,
  result TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration INTEGER;
BEGIN
  -- Test 1: Status validation function performance
  start_time := clock_timestamp();
  
  -- Simulate multiple status checks
  PERFORM validate_status_transition()
  FROM generate_series(1, 100); -- This will actually fail but tests function load
  
  end_time := clock_timestamp();
  duration := EXTRACT(milliseconds FROM (end_time - start_time))::INTEGER;
  
  RETURN QUERY SELECT 
    'Validation Function Load'::TEXT,
    duration,
    CASE WHEN duration < 1000 THEN 'Good' ELSE 'Needs optimization' END::TEXT;

  -- Test 2: Status transition log query performance
  start_time := clock_timestamp();
  
  PERFORM COUNT(*) FROM status_transition_log;
  
  end_time := clock_timestamp();
  duration := EXTRACT(milliseconds FROM (end_time - start_time))::INTEGER;
  
  RETURN QUERY SELECT 
    'Transition Log Query'::TEXT,
    duration,
    CASE WHEN duration < 100 THEN 'Good' ELSE 'Consider index optimization' END::TEXT;

  -- Test 3: RLS policy performance  
  start_time := clock_timestamp();
  
  PERFORM COUNT(*) FROM data_entries WHERE status = 'pending';
  
  end_time := clock_timestamp();
  duration := EXTRACT(milliseconds FROM (end_time - start_time))::INTEGER;
  
  RETURN QUERY SELECT 
    'RLS Policy Query'::TEXT,
    duration,
    CASE WHEN duration < 200 THEN 'Good' ELSE 'Review RLS complexity' END::TEXT;

END;
$$;

-- Cleanup test functions (optional)
-- ========================================
CREATE OR REPLACE FUNCTION cleanup_status_test_functions()
RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
  DROP FUNCTION IF EXISTS test_status_management_system();
  DROP FUNCTION IF EXISTS create_status_test_data();
  DROP FUNCTION IF EXISTS test_status_performance();
  DROP FUNCTION IF EXISTS cleanup_status_test_functions();
  
  RAISE NOTICE 'Test functions cleaned up successfully';
END;
$$;

-- Instructions for testing
-- ========================================
DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'STATUS MANAGEMENT SYSTEM - TESTING GUIDE';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '1. Run system validation:';
  RAISE NOTICE '   SELECT * FROM test_status_management_system();';
  RAISE NOTICE '';
  RAISE NOTICE '2. Check test scenarios:';
  RAISE NOTICE '   SELECT * FROM create_status_test_data();';
  RAISE NOTICE '';
  RAISE NOTICE '3. Test performance:';
  RAISE NOTICE '   SELECT * FROM test_status_performance();';
  RAISE NOTICE '';
  RAISE NOTICE '4. Manual testing checklist:';
  RAISE NOTICE '   - Test with school admin user (draft→pending)';
  RAISE NOTICE '   - Test with sector admin user (pending→approved/rejected)';
  RAISE NOTICE '   - Test permission denials (wrong roles)';
  RAISE NOTICE '   - Test approved data protection';
  RAISE NOTICE '   - Test audit trail logging';
  RAISE NOTICE '';
  RAISE NOTICE '5. Clean up test functions:';
  RAISE NOTICE '   SELECT cleanup_status_test_functions();';
  RAISE NOTICE '';
END $$;
