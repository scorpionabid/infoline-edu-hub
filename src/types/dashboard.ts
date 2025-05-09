
import { AppNotification } from './notification';
import { SchoolStat } from './supabase';

export interface StatusSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  active?: number;
  inactive?: number;
  draft?: number;
}

export interface CompletionSummary {
  total: number;
  completed: number;
  percentage: number;
}

export interface FormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  draft?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number;
  status?: string;
}

export interface FormItem {
  id: string;
  name: string;
  category?: string;
  categoryId?: string;
  deadline?: string;
  status: string;
  submittedAt?: string;
  updatedAt?: string;
  completionRate?: number;
}

export interface DeadlineItem {
  id: string;
  title: string;
  category?: string;
  categoryId?: string;
  deadline: string;
  daysRemaining: number;
  status: string;
}

export interface PendingApprovalItem {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  status: string;
  submittedAt: string;
  entries?: any[];
}

export interface DashboardData {
  completion: CompletionSummary;
  status: StatusSummary;
  formStats?: FormStats;
  completionRate?: number;
  notifications?: AppNotification[];
}

export interface SchoolAdminDashboardData extends DashboardData {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
}

export interface SectorAdminDashboardData extends DashboardData {
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApprovalItem[];
}

export interface RegionAdminDashboardData extends DashboardData {
  sectorStats: {
    id: string;
    name: string;
    completionRate: number;
    schoolCount: number;
    pendingApprovals: number;
  }[];
  pendingApprovals: PendingApprovalItem[];
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export interface SchoolAdminDashboardProps {
  data?: SchoolAdminDashboardData;
  schoolId?: string;
}

export interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}
