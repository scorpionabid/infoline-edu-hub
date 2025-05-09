
// Add missing types for dashboard data

export interface RegionStat {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  completionRate: number;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  pendingCount?: number;
  lastUpdate?: string;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  deadline: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: string;
  isRead: boolean;
}

export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  createdAt: string;
  submittedAt: string;
  count?: number;
}
