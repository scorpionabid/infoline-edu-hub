
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

export interface ReportData {
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
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportConfig {
  columns?: string[];
  filters?: Record<string, any>;
  groupBy?: string;
  sortBy?: string;
  chartType?: string;
}

// Enhanced dashboard statistics with all required fields
export interface DetailedDashboardStatistics {
  overview: {
    total_regions: number;
    total_sectors: number;
    total_schools: number;
    total_categories: number;
    overall_completion_rate: number;
  };
  recent_activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user_name: string;
  }>;
  pending_approvals: Array<{
    id: string;
    school_name: string;
    category_name: string;
    submitted_at: string;
    submitted_by: string;
  }>;
  // Database schema compatible fields
  total_schools: number;
  active_schools: number;
  total_students: number;
  total_teachers: number;
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  // Legacy compatibility fields
  regions: number;
  sectors: number;
  schools: number;
  totalSectors: number;
}

// Missing exports that are being imported
export interface DetailedSchoolPerformanceData {
  school_id: string;
  school_name: string;
  region_name: string;
  sector_name: string;
  completion_rate: number;
  categories: Array<{
    category_id: string;
    category_name: string;
    completion_rate: number;
    filled_columns: number;
    total_columns: number;
  }>;
}

export interface DetailedRegionalComparisonData {
  region_id: string;
  region_name: string;
  total_schools: number;
  completed_schools: number;
  average_completion_rate: number;
  sectors: Array<{
    sector_id: string;
    sector_name: string;
    school_count: number;
    completion_rate: number;
  }>;
}

export interface DetailedCategoryCompletionData {
  category_id: string;
  category_name: string;
  description?: string;
  total_schools: number;
  completed_schools: number;
  completion_rate: number;
  deadline?: string;
  regions: Array<{
    region_id: string;
    region_name: string;
    completion_rate: number;
    school_count: number;
  }>;
}

export interface DetailedSchoolDataByCategoryData {
  category_id: string;
  category_name: string;
  schools: Array<{
    school_id: string;
    school_name: string;
    region_name: string;
    sector_name: string;
    columns: Record<string, {
      value: any;
      status: string;
    }>;
    completion_rate: number;
  }>;
}

export interface ReportsFilters {
  search?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  category_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

// Dashboard service compatible types
export interface DashboardFormStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  // Legacy fields for backward compatibility
  regions?: number;
  sectors?: number;
  schools?: number;
  drafts?: number;
}

export interface SuperAdminDashboardData {
  formStats: DashboardFormStats;
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount: number;
  approvalRate: number;
  completionRate: number;
  regions: any[];
  recentActivity: any[];
  notifications: any[];
  formsByStatus: any[];
}

export interface RegionAdminDashboardData {
  formStats: DashboardFormStats;
  pendingItems: any[];
  recentActivity: any[];
  notifications: any[];
  completionRate: number;
}

export interface SectorAdminDashboardData {
  formStats: DashboardFormStats;
  pendingItems: any[];
  recentActivity: any[];
  notifications: any[];
  completionRate: number;
}

export interface SchoolAdminDashboardData {
  formStats: DashboardFormStats;
  categories: any[];
  notifications: any[];
  completionRate: number;
  deadlines: any[];
  stats: any;
}
