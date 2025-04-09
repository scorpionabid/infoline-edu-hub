
import { Notification } from './notification';

export interface FormItem {
  id: string;
  title: string;
  status: string;
  date: string;
  category?: string;
}

export interface SchoolAdminDashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  completionRate: number;
  notifications: Notification[];
  pendingForms: FormItem[];
  categories: number;
}

export interface AdminDashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
}
