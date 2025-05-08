
import { ReactNode } from 'react';
import { AppNotification } from './notification';

export interface DeadlineItem {
  id: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  deadline?: string;
  status?: string;
  priority?: string;
  completionRate?: number;
  date?: string;
}

export interface FormItem {
  id: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  status: string;
  lastUpdate?: string;
  priority?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status?: string;
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface DashboardData {
  completionRate: number;
  status: DashboardStatus;
  formStats: DashboardFormStats;
}

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
  active: number;
  inactive: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon: number;
  overdue: number;
  incomplete?: number;
  total: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number;
  status?: string;
}

export interface SchoolAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: DashboardStatus;
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  formStats: DashboardFormStats;
  pendingForms: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  timestamp?: string;
  createdAt?: string;
  priority?: string;
}

export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  submittedAt: string;
  date?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export interface SectorAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: DashboardStatus;
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApproval[];
  formStats: DashboardFormStats;
  completionRate: number;
}
