
export interface DashboardFormStats {
  total: number;
  completed: number;
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon?: number;
  overdue?: number;
  percentage?: number;
  completion_rate?: number;
  completionRate?: number;
  completedForms?: number;
  pendingForms?: number;
  totalForms?: number;
  pendingApprovals?: number;
  rejectedForms?: number;
  approvalRate?: number;
}

export interface StatsGridItem {
  title: string;
  value: string | number;
  color: string;
  description: string;
  icon: string;
}

export interface SuperAdminDashboardData {
  totalUsers: number;
  totalRegions: number;
  totalSectors: number;
  totalSchools: number;
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount: number;
  approvalRate: number;
  completionRate: number;
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  regions: Array<{
    id: string;
    name: string;
    sectorCount: number;
    adminEmail?: string;
  }>;
  notifications: any[];
  pendingApprovals: any[];
  regionStats: any[];
  categories: any[];
  deadlines: any[];
}

export interface RegionAdminDashboardData {
  completionRate: number;
  formStats: DashboardFormStats;
  sectors: Array<{
    id: string;
    name: string;
    schoolCount: number;
    totalSchools: number;
    activeSchools: number;
    completionRate: number;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  categories: any[];
  pendingItems: any[];
  notifications: any[];
}

export interface SectorAdminDashboardData {
  completionRate: number;
  formStats: DashboardFormStats;
  schools: Array<{
    id: string;
    name: string;
    completionRate: number;
    totalForms: number;
    completedForms: number;
    pendingForms: number;
    status: string;
    lastUpdated: string;
    created_at: string;
    updated_at: string;
  }>;
  categories: any[];
  pendingItems: any[];
  notifications: any[];
}

export interface SchoolAdminDashboardData {
  completionRate: number;
  stats: {
    completed: number;
    pending: number;
  };
  formStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    drafts: number;
    incomplete: number;
    dueSoon: number;
  };
  categories: any[];
  deadlines: any[];
  notifications: any[];
}
