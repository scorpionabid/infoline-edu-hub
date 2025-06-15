
// Report system types

export interface SchoolPerformanceData {
  school_id: string;
  school_name: string;
  completion_rate: number;
  total_categories: number;
  completed_categories: number;
}

export interface RegionalComparisonData {
  region_id: string;
  region_name: string;
  average_completion: number;
  school_count: number;
  top_performers: number;
}

export interface CategoryCompletionData {
  category_id: string;
  category_name: string;
  total_schools: number;
  completed_schools: number;
  completion_percentage: number;
}

export interface SchoolDataByCategoryData {
  school_id: string;
  school_name: string;
  categories: Record<string, {
    completed: boolean;
    completion_rate: number;
    data_count: number;
  }>;
}

export interface DashboardStatistics {
  total_schools: number;
  total_regions: number;
  total_sectors: number;
  total_categories: number;
  overall_completion: number;
  pending_approvals: number;
}

export interface ReportsFilters {
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
}

// Advanced report types
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  config: any;
  status: string;
  is_public?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AdvancedReport {
  id: string;
  title: string;
  description?: string;
  type: string;
  content: any;
  filters: any;
  status: string;
  is_template?: boolean;
  is_public?: boolean;
  shared_with?: any[];
  insights?: string[];
  recommendations?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Detailed report interfaces
export interface DetailedSchoolPerformanceData {
  school_id: string;
  school_name: string;
  principal_name?: string;
  region_id: string;
  region_name: string;
  sector_id: string;
  sector_name: string;
  student_count?: number;
  teacher_count?: number;
  completion_rate: number;
  total_entries: number;
  approved_entries: number;
  pending_entries: number;
  rejected_entries: number;
  approval_rate: number;
  last_submission?: string;
  categories_covered: number;
  phone?: string;
  email?: string;
  address?: string;
  status: string;
}

export interface DetailedRegionalComparisonData {
  region_id: string;
  region_name: string;
  total_schools: number;
  active_schools: number;
  total_sectors: number;
  total_students: number;
  total_teachers: number;
  avg_completion_rate: number;
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  rejected_submissions: number;
  approval_rate: number;
  schools_with_submissions: number;
  submission_rate: number;
}

export interface DetailedCategoryCompletionData {
  category_id: string;
  category_name: string;
  category_description?: string;
  assignment: string;
  deadline?: string;
  total_columns: number;
  required_columns: number;
  schools_completed: number;
  schools_partial: number;
  schools_not_started: number;
  total_schools: number;
  completion_percentage: number;
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  avg_completion_time_days?: number;
}

export interface DetailedSchoolDataByCategoryData {
  column_id: string;
  column_name: string;
  column_type: string;
  is_required: boolean;
  order_index: number;
  placeholder?: string;
  help_text?: string;
  options?: any;
  validation?: any;
  value?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export interface DetailedDashboardStatistics {
  total_schools: number;
  active_schools: number;
  total_regions?: number;
  total_sectors?: number;
  total_students: number;
  total_teachers: number;
  avg_completion_rate?: number;
  completion_rate?: number; // For school admin
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  rejected_submissions?: number;
  approval_rate?: number;
  schools_with_high_completion?: number;
  schools_needing_attention?: number;
  total_categories?: number;
  completed_categories?: number;
  recent_activities?: Array<{
    school_name?: string;
    action: string;
    category: string;
    status?: string;
    timestamp: string;
  }>;
  top_performing_schools?: Array<{
    school_name: string;
    completion_rate: number;
    total_submissions: number;
  }>;
}
