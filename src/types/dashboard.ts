
export interface DashboardStatus {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  active: number;
  inactive: number;
  draft?: number;
}

export interface DashboardCompletion {
  total: number;
  completed: number;
  percentage: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  dueSoon: number;
  overdue: number;
  draft: number;
}

export interface SuperAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
  regionStats: Array<any>;
  pendingApprovals: Array<any>;
}

export interface RegionAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
  sectorStats: Array<any>;
  pendingApprovals: Array<any>;
}

export interface SectorAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
  schoolStats: Array<any>;
  pendingApprovals: Array<any>;
  categories: Array<any>;
  upcoming: Array<any>;
  pendingForms: Array<any>;
}

export interface SchoolAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
  categories: Array<any>;
  upcoming: Array<any>;
  pendingForms: Array<any>;
}

export interface PendingApproval {
  id: string;
  title: string;
  schoolName: string;
  status: 'pending' | 'approved' | 'rejected';
  categoryName?: string;
  submittedBy?: string;
  submittedAt: string;
  dueDate?: string;
}
