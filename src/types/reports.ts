
export type ReportType = 'completion' | 'approval' | 'performance' | 'statistics' | 'custom';
export type ReportStatus = 'draft' | 'published' | 'archived';

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  status: ReportStatus;
  config: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public?: boolean; // Add missing property
}

export interface DashboardFormStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface SuperAdminDashboardData {
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount: number;
  approvalRate: number;
  completionRate: number;
  regions: any[];
  notifications: any[];
  formsByStatus: DashboardFormStats;
}

export interface RegionAdminDashboardData {
  pendingItems: number;
  notifications: any[];
  completionRate: number;
}

export interface SectorAdminDashboardData {
  pendingItems: number;
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

export interface DetailedDashboardStatistics {
  overview: {
    total_schools: number;
    active_schools: number;
    total_students: number;
    total_teachers: number;
  };
  submissions: {
    total_submissions: number;
    approved_submissions: number;
    pending_submissions: number;
  };
  recent_activity: any[];
  pending_approvals: any[];
  regions: any[];
  sectors: any[];
  schools: any[];
}
