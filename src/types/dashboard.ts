
// Əgər bu fayl mövcud deyilsə, onu yaradaq
import { AppNotification, DashboardNotification } from './notification';

export interface CompletionData {
  percentage: number;
  total: number;
  completed: number;
}

export interface DashboardStatus {
  total: number;
  active: number;
  inactive: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  draft?: number;
}

export interface DashboardFormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
}

export interface SchoolAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  categories: CategoryData[];
  upcoming: DeadlineItem[];
  notifications: DashboardNotification[];
  completionRate: number;
  pendingForms: FormItem[];
  formStats?: DashboardFormStats;
}

export interface SuperAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  regions: number;
  sectors: number;
  schools: number;
  notifications: DashboardNotification[];
  formStats?: DashboardFormStats;
}

export interface RegionAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  sectors: SectorData[];
  schoolStats: SchoolStats[];
  notifications: DashboardNotification[];
  formStats?: DashboardFormStats;
}

export interface SectorAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  schoolStats: SchoolStats[];
  pendingApprovals: PendingApproval[];
  notifications: DashboardNotification[];
  formStats?: DashboardFormStats;
}

export interface SectorData {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface SchoolStats {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  lastUpdate?: string;
}

export interface CategoryData {
  id: string;
  name: string;
  completionRate: number;
  deadline?: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  columnCount?: number;
}

export interface DeadlineItem {
  id: string;
  categoryId: string;
  category: string;
  categoryName?: string;
  deadline: string;
  status: 'upcoming' | 'due' | 'overdue';
  daysRemaining: number;
}

export interface FormItem {
  id: string;
  categoryId: string;
  category: string;
  categoryName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  submittedAt?: string;
  updatedAt?: string;
}

export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type FormStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
};

export type CompletionStats = {
  percentage: number;
  total: number;
  completed: number;
};
