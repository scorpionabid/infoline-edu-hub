import { AppNotification } from './notification';

export type DashboardStatus = {
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  approved: number;
};

export type DashboardFormStats = {
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  rejectedForms: number;
  approvedForms: number;
};

export interface CategoryItem {
  id: string;
  name: string;
  totalForms: number;
  completedForms: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'rejected' | 'approved';
  completion?: number;
  deadline?: string;
  school?: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadline: string;
  status: 'active' | 'completed' | 'pending';
}

export interface PendingApproval {
  id: string;
  title: string;
  submittedBy: string;
  submissionDate: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  totalForms: number;
  completedForms: number;
  completionRate: number;
}

export interface SectorStat {
  id: string;
  name: string;
  totalSchools: number;
  totalForms: number;
  completedForms: number;
  completionRate: number;
}

export interface SchoolAdminDashboardData {
  status?: DashboardStatus | null;
  formStats?: DashboardFormStats | null;
  categories?: CategoryItem[] | null;
  forms?: FormItem[] | null;
  deadlines?: DeadlineItem[] | null;
  pendingApprovals?: PendingApproval[] | null;
  notifications?: AppNotification[] | null;
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
}

export interface RegionAdminDashboardData {
  status?: DashboardStatus | null;
  formStats?: DashboardFormStats | null;
  categories?: CategoryItem[] | null;
  forms?: FormItem[] | null;
  deadlines?: DeadlineItem[] | null;
  pendingApprovals?: PendingApproval[] | null;
  schoolStats?: SchoolStat[] | null;
  notifications?: AppNotification[] | null;
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
}

export interface SectorAdminDashboardData {
  status?: DashboardStatus | null;
  formStats?: DashboardFormStats | null;
  categories?: CategoryItem[] | null;
  forms?: FormItem[] | null;
  deadlines?: DeadlineItem[] | null;
  pendingApprovals?: PendingApproval[] | null;
  schoolStats?: SchoolStat[] | null;
  notifications?: AppNotification[] | null;
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
}

export interface SuperAdminDashboardData {
  status?: DashboardStatus | null;
  formStats?: DashboardFormStats | null;
  categories?: CategoryItem[] | null;
  forms?: FormItem[] | null;
  deadlines?: DeadlineItem[] | null;
  pendingApprovals?: PendingApproval[] | null;
  regionStats?: any[] | null;
  sectorStats?: any[] | null;
  schoolStats?: any[] | null;
  notifications?: AppNotification[] | null;
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
}
