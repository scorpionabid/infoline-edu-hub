import { AppNotification } from './notification';

export interface SchoolAdminDashboardData {
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  forms?: FormItem[];
  deadlines?: DeadlineItem[];
  pendingApprovals?: PendingApproval[];
  notifications?: AppNotification[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
}

export interface RegionAdminDashboardData {
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  forms?: FormItem[];
  deadlines?: DeadlineItem[];
  pendingApprovals?: PendingApproval[];
  schoolStats?: SchoolStat[];
  notifications?: AppNotification[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
}

export interface SectorAdminDashboardData {
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  forms?: FormItem[];
  deadlines?: DeadlineItem[];
  pendingApprovals?: PendingApproval[];
  schoolStats?: SchoolStat[];
  notifications?: AppNotification[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
}

export interface SuperAdminDashboardData {
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  forms?: FormItem[];
  deadlines?: DeadlineItem[];
  pendingApprovals?: PendingApproval[];
  regionStats?: any[];
  sectorStats?: SectorStat[];
  schoolStats?: SchoolStat[];
  notifications?: AppNotification[];
}

export interface DashboardStatus {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface DashboardFormStats {
  totalForms: number;
  pendingForms: number;
  approvedForms: number;
  rejectedForms: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  completionRate?: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  submissions?: number;
  completion?: number;
  deadline?: string; // Added missing deadline property
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadline: string;
  description?: string;
  status?: 'active' | 'completed' | 'overdue';
}

export interface PendingApproval {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status?: 'active' | 'inactive';
}

export interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  schoolCount?: number;
  studentCount?: number;
}
