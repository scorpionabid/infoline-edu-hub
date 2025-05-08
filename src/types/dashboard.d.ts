
export type CompletionData = {
  percentage: number;
  total: number;
  completed: number;
};

export type SchoolCompletionData = CompletionData;

export type DashboardStatus = {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  active: number;
  inactive: number;
};

export type FormStats = {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  total: number;
};

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string | Date;
  completionRate: number;
  status?: string;
  categoryName?: string;
}

export interface DeadlineItem {
  id: string;
  category: string;
  categoryId: string;
  deadline: string;
  status: string;
  completionRate?: number;
  categoryName?: string;
}

export interface FormItem {
  id: string;
  category: string;
  categoryId: string;
  date: string;
  status: string;
  submittedAt?: string;
  categoryName?: string;
}

export interface SchoolAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  formStats: FormStats;
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
}
