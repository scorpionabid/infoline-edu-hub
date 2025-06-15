
export interface EnhancedSchoolData {
  id: string;
  name: string;
  principal_name: string;
  region_id: string;
  region_name: string;
  sector_id: string;
  sector_name: string;
  status: string;
  completion_rate: number;
  columns: Record<string, any>;
  completion_stats: {
    total_required: number;
    filled_count: number;
    approved_count: number;
    completion_rate: number;
  };
}

export interface SchoolPerformanceData {
  school_id: string;
  school_name: string;
  completion_rate: number;
  total_entries: number;
  approved_entries: number;
  pending_entries: number;
  rejected_entries: number;
}

export interface RegionalComparisonData {
  region_id: string;
  region_name: string;
  total_schools: number;
  avg_completion_rate: number;
  total_entries: number;
  approved_entries: number;
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
  category_id: string;
  category_name: string;
  completion_status: string;
  last_updated: string;
}

export interface DashboardStatistics {
  total_schools: number;
  total_categories: number;
  total_entries: number;
  overall_completion_rate: number;
  pending_approvals: number;
}

export interface ReportsFilters {
  region_id?: string;
  sector_id?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
  status?: string[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  config: any;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
