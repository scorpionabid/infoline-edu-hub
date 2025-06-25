
export interface SuperAdminDashboardData {
  totalSchools: number;
  totalUsers: number;
  totalCategories: number;
  pendingApprovals: number;
  completionRate: number;
  stats: DashboardStats;
  forms: DashboardFormStats;
  userCount?: number;
}

export interface RegionAdminDashboardData {
  totalSectors: number;
  totalSchools: number;
  pendingApprovals: number;
  completionRate: number;
  stats: DashboardStats;
  forms: DashboardFormStats;
  deadlines?: any[];
}

export interface SectorAdminDashboardData {
  totalSchools: number;
  pendingApprovals: number;
  completionRate: number;
  stats: DashboardStats;
  forms: DashboardFormStats;
}

export interface SchoolAdminDashboardData {
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  stats: DashboardStats;
  forms: DashboardFormStats;
}

export interface DashboardStats {
  totalEntries: number;
  completedEntries: number;
  pendingEntries: number;
  approvedEntries: number;
  rejectedEntries: number;
}

export interface DashboardFormStats {
  totalForms: number;
  pendingApprovals: number;
  rejectedForms: number;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  percentage: number;
  completion_rate: number;
  completionRate: number;
  completedForms: number;
  pendingForms: number;
  approvalRate: number;
  completed: number;
}

export interface EnhancedDashboardData {
  [key: string]: any;
}

export interface CategoryProgress {
  id: string;
  name: string;
  progress: number;
}

export interface ColumnStatus {
  id: string;
  name: string;
  status: string;
}
