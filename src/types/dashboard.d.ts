
export interface StatusCardsProps {
  completedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalCount: number;
  isLoading?: boolean;
}

export interface DashboardFormStats {
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  completion_rate: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  completion_rate?: number;
  deadline?: string;
  priority?: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  created_at: string;
  updated_at?: string;
  school_id?: string;
  category_id?: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  name: string;
  deadline: string;
  daysLeft: number;
  priority?: 'high' | 'medium' | 'low';
  status?: string;
  category_id?: string;
}

export interface PendingApproval {
  id: string;
  title: string;
  type: string;
  created_at: string;
  school_name?: string;
  category_name?: string;
  status: 'pending';
}

export interface SchoolStat {
  id: string;
  name: string;
  completion_rate: number;
  total_entries?: number;
  totalEntries?: number;
  pending_entries?: number;
  pendingEntries?: number;
  pendingCount?: number;
  approved_entries?: number;
  status?: 'active' | 'inactive';
  region_id?: string;
  sector_id?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  completion_rate: number;
  completion?: number;
  total_schools: number;
  pending_approvals: number;
  approved_entries: number;
  region_id?: string;
}

export interface SuperAdminDashboardData {
  stats: DashboardFormStats;
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
  upcomingDeadlines: DeadlineItem[];
  regionStats: any[];
  sectorStats: SectorStat[];
  schoolStats: SchoolStat[];
  notifications?: any[];
}

export interface RegionAdminDashboardData {
  stats: DashboardFormStats;
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
  upcomingDeadlines: DeadlineItem[];
  sectorStats: SectorStat[];
  schoolStats: SchoolStat[];
  notifications?: any[];
}

export interface SectorAdminDashboardData {
  stats: DashboardFormStats;
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
  upcomingDeadlines: DeadlineItem[];
  schoolStats: SchoolStat[];
  notifications?: any[];
}

export interface SchoolAdminDashboardData {
  stats: DashboardFormStats;
  categories: CategoryItem[];
  upcomingDeadlines: DeadlineItem[];
  completion: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
  notifications?: any[];
}
