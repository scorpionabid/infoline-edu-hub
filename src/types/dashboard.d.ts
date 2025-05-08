
export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  active: number;
  inactive: number;
}

export interface DashboardCompletion {
  percentage: number;
  total: number;
  completed: number;
}

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
  categoryId: string;
  categoryName: string;
  deadline: string;
  completionRate: number;
  status?: string;
}

export interface FormItem {
  id: string;
  categoryId: string;
  categoryName: string;
  deadline?: string;
  completionRate: number;
  status: string;
  lastUpdated?: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp?: string;
  createdAt?: string;
  priority?: 'low' | 'normal' | 'high';
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface SchoolAdminDashboardData {
  completion?: DashboardCompletion;
  status?: DashboardStatus;
  categories?: CategoryItem[];
  upcoming?: DeadlineItem[];
  formStats?: DashboardFormStats;
  pendingForms?: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface SchoolAdminDashboardProps {
  isLoading: boolean;
  error: any;
  onRefresh?: () => void;
  navigateToDataEntry?: (categoryId: string) => void;
  handleFormClick?: (formId: string) => void;
  schoolId?: string;
}
