
// This is a minimal implementation - add more fields as needed
export interface DashboardNotification {
  id: string;
  title: string;
  message?: string;
  createdAt: string;
  type?: string;
  isRead?: boolean;
  priority?: 'low' | 'medium' | 'high';
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number;
  status?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  formsTotal: number;
  formsCompleted: number;
  formsPending: number;
  lastUpdate: string;
  pendingForms?: number;
  principal?: string;
  principalName?: string;
}

// Additional types needed
export type Category = {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate?: number;
  status?: string;
};

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
  active: number; 
  inactive: number;
}

export interface CompletionData {
  percentage: number;
  total: number;
  completed: number;
}

export interface FormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

export interface DeadlineItem {
  id: string;
  title: string;
  category?: string;
  categoryName?: string;
  deadline: string;
  status?: string;
}

export interface FormItem {
  id: string;
  title: string;
  category?: string;
  categoryName?: string;
  status: string;
  updatedAt: string;
}

export interface DashboardCategory extends Category {
  columns?: number;
  completionRate?: number;
}

export interface CategoryWithCompletion extends Category {
  completionRate: number;
}

export interface SchoolCompletionItem {
  id: string;
  name: string;
  completionRate: number;
}

export interface SectorCompletionItem {
  id: string;
  name: string;
  completionRate: number;
  schoolCount: number;
}

export interface SchoolAdminDashboardProps {
  schoolId?: string;
  data?: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  handleFormClick?: (formId: string) => void;
  navigateToDataEntry?: () => void;
}

export interface SchoolAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  categories: CategoryItem[] | Category[];
  upcoming: DeadlineItem[];
  formStats?: FormStats;
  pendingForms: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
}
