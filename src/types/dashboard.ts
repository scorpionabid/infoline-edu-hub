
import { Notification } from './notification';

export interface FormItem {
  id: string;
  title: string;
  status: string;
  date: string;
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
