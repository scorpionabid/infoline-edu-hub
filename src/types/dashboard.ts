
export interface FormItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: string;
  completionPercentage: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  priority: string;
  type: string;
}

export interface SchoolAdminDashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  completionRate: number;
  notifications: Notification[];
  pendingForms: FormItem[];
}
