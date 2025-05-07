
export interface FormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
}

export interface CategoryWithCompletion {
  id: string;
  name: string;
  completionPercentage: number;
  status: 'completed' | 'inProgress' | 'notStarted';
  dueDate?: string;
}

export interface FormItem {
  id: string;
  name: string;
  category: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  completionPercentage: number;
}

export interface SchoolCompletionItem {
  id: string;
  name: string;
  completionPercentage: number;
  status: 'completed' | 'inProgress' | 'notStarted';
  pendingCount: number;
}

export interface SectorCompletionItem {
  id: string;
  name: string;
  completionPercentage: number;
  schoolCount: number;
  completedSchools: number;
}

export interface CompletionStats {
  total: number;
  completed: number;
  percentage: number;
}

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface DashboardCategory {
  id: string;
  name: string;
  completion: number;
  dueDate?: string | null;
  status: 'completed' | 'inProgress' | 'notStarted';
}

export interface PendingForm {
  id: string;
  categoryId: string;
  categoryName: string;
  dueDate?: string;
  status: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  link?: string;
  category?: string;
  entity?: {
    type: string;
    id: string;
    name?: string;
  };
}

export interface PendingItem {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ActivityLogItem {
  id: string;
  action: string;
  user: string;
  entity: string;
  date: string;
  details?: string;
}

export interface DashboardStats {
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  forms: FormStats;
  categories: {
    total: number;
    active: number;
    upcoming: number;
    expired: number;
  };
  users: {
    total: number;
    active: number;
    pending: number;
  };
  regions?: {
    total: number;
    completed: number;
    inProgress: number;
  };
  sectors?: {
    total: number;
    completed: number;
    inProgress: number;
  };
}

export interface SuperAdminDashboardData {
  stats: DashboardStats;
  regionalCompletion: SectorCompletionItem[];
  recentActivity: ActivityLogItem[];
  upcomingDeadlines: DashboardCategory[];
  notifications: DashboardNotification[];
}

export interface SchoolAdminDashboardData {
  completion: CompletionStats;
  status: DashboardStatus;
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  categories: DashboardCategory[];
  upcoming: FormItem[];
  pendingForms: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
}
