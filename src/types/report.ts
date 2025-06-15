
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
