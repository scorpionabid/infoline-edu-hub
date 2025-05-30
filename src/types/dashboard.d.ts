
export interface DashboardFormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  completed: number;
  percentage: number;
  completion_rate: number;
  approvedForms?: number;
  pendingForms?: number;
  rejectedForms?: number;
}

export interface PendingApproval {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  schoolName?: string;
  categoryName?: string;
  submittedAt?: string;
  date?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  completion_rate?: number;
  status?: string;
  description?: string;
}

export interface FormItem {
  id: string;
  name: string;
  status?: string;
  category_id?: string;
}

export interface DeadlineItem {
  id: string;
  name: string;
  deadline: string;
  status?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  completion_rate?: number;
  totalEntries?: number;
  total_entries?: number;
  pendingEntries?: number;
  pending_entries?: number;
  pendingCount?: number;
  pendingForms?: number;
  approved_entries?: number;
  status?: 'active' | 'inactive';
  region_id?: string;
  sector_id?: string;
  formsCompleted?: number;
  totalForms?: number;
  lastUpdate?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  schoolCount?: number;
  totalSchools?: number;
  completedSchools?: number;
  pendingSchools?: number;
}

export interface RegionAdminDashboardData {
  status?: {
    total: number;
    active: number;
    inactive: number;
    pending?: number;
    approved?: number;
    rejected?: number;
    draft?: number;
  };
  formStats?: DashboardFormStats;
  completion?: {
    percentage: number;
  } | number;
  completionRate?: number;
  sectorStats?: SectorStat[];
  pendingApprovals?: PendingApproval[];
  categories?: CategoryItem[];
  upcomingDeadlines?: DeadlineItem[];
  schoolStats?: SchoolStat[];
}

export interface SectorAdminDashboardData extends RegionAdminDashboardData {
  schoolStats?: SchoolStat[];
}

export interface SchoolAdminDashboardData extends RegionAdminDashboardData {
  categories?: CategoryItem[];
  formItems?: FormItem[];
}

export interface SuperAdminDashboardData extends RegionAdminDashboardData {
  regionStats?: any[];
  systemStats?: any;
}
