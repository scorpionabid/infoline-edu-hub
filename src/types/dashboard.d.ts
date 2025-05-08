
export interface DashboardStat {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  draft: number;
  dueSoon?: number;
  overdue?: number;
}

export interface FormStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SuperAdminDashboardData {
  formStats: DashboardFormStats;
  regionCompletion: { region: string; completionRate: number }[];
  recentForms: PendingApproval[];
}

export interface RegionAdminDashboardData {
  formStats: DashboardFormStats;
  sectorCompletion: { sector: string; completionRate: number }[];
  recentForms: PendingApproval[];
}
