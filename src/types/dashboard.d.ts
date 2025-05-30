
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
}

export interface PendingApproval {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
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
  sectorStats?: any[];
  pendingApprovals?: PendingApproval[];
  categories?: any[];
  upcomingDeadlines?: any[];
  schoolStats?: any[];
}
