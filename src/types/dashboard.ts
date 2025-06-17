
// Dashboard types with proper structure
export interface DashboardFormStats {
  totalForms: number;
  completedForms: number;
  pendingApprovals: number;
  rejectedForms: number;
  totalRegions?: number;
  totalSectors?: number;
  totalSchools?: number;
}

export interface SuperAdminDashboardData {
  stats: DashboardFormStats;
  totalRegions: number;
  totalSectors: number;
  totalSchools: number;
  totalUsers: number;
  regionStats: any[];
  approvalRate: number;
  completionRate: number;
  regions: any[];
  pendingApprovals: any[];
  notifications: any[];
  formsByStatus: any;
}

export interface RegionAdminDashboardData {
  stats: DashboardFormStats;
  formStats: DashboardFormStats;
  pendingItems: any[];
  categories: any[];
  sectors: any[];
  notifications: any[];
  completionRate: number;
}
