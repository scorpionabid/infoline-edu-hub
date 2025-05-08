
import { ReactNode } from 'react';

export interface StatsCardProps {
  title: string;
  value: number;
  description?: string;
  icon?: ReactNode;
  trend?: number;
  className?: string;
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

export type FormStats = DashboardFormStats;

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number;
  status?: string;
}

export interface DeadlineItem {
  id: string;
  name?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  date?: string;
  deadline?: string;
  status?: string;
  completionRate?: number;
}

export interface FormItem {
  id: string;
  name?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  date?: string;
  deadline?: string;
  status?: string;
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

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  formsCount?: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message?: string;
  type: string;
  date: string;
  isRead: boolean;
  priority?: string;
}

export interface SchoolAdminDashboardData {
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  };
  categories?: CategoryItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  completionRate?: number;
  notifications?: DashboardNotification[];
}

export interface SchoolAdminDashboardProps {
  schoolId?: string;
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  navigateToDataEntry?: (categoryId: string) => void;
  handleFormClick?: (form: FormItem) => void;
}
