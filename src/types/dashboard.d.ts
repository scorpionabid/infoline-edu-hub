
import { Category, CategoryStatus } from './category';

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  pendingCount: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ProgressItem {
  id: string;
  name: string;
  progress: number;
  target: number;
  percentage: number;
  status: string;
}

export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  submittedAt: string;
  count: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: string;
  dueDate: string;
  progress: number;
}

export interface DashboardNotification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  read: boolean;
  link?: string;
}

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  active: number;
  inactive: number;
}

export interface DashboardCompletion {
  percentage: number;
  total: number;
  completed: number;
}

export interface FormStats {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

export interface SchoolAdminDashboardData {
  completion: DashboardCompletion;
  status: DashboardStatus;
  categories: Category[];
  upcoming: FormItem[];
  formStats: FormStats;
  pendingForms: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
}
