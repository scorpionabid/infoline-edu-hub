
import { Report, ReportType } from './report';

export interface FormStats {
  completed: number;
  pending: number;
  rejected: number;
  total: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface ChartData {
  activityData: Array<{ name: string; value: number }>;
  regionSchoolsData: Array<{ name: string; value: number }>;
  categoryCompletionData: Array<{ name: string; completed: number }>;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  overallRate?: number;
  status: string;
  deadline?: string;
  completion?: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface PendingApproval {
  id: string;
  title: string;
  status: 'pending';
  date?: string;
  school: string;
  schoolName: string;
  categoryName: string;
  submittedAt: string;
}

export interface SuperAdminDashboardData {
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  completionRate: number;
  pendingApprovals: PendingApproval[];
  regions: Array<{
    id: string;
    name: string;
    sectorCount: number;
    schoolCount: number;
    completionRate: number;
  }>;
  notifications: DashboardNotification[];
  categories: CategoryStat[];
}

export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
  };
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  completionRate: number;
  pendingApprovals: PendingApproval[];
  sectors: Array<{
    id: string;
    name: string;
    schoolCount: number;
    completionRate: number;
  }>;
  notifications: DashboardNotification[];
  categories: CategoryStat[];
}

export interface SectorAdminDashboardData {
  stats: {
    schools: number;
    users: number;
  };
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  completionRate: number;
  pendingApprovals: PendingApproval[];
  schools: Array<{
    id: string;
    name: string;
    completionRate: number;
  }>;
  notifications: DashboardNotification[];
  categories: CategoryStat[];
}

export interface SchoolAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    active: number;
    inactive: number;
  };
  categories: CategoryStat[];
  upcoming: Array<{
    id: string;
    title: string;
    deadline: string;
    daysLeft: number;
  }>;
  formStats: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingForms: Array<{
    id: string;
    title: string;
    status: string;
    submittedAt: string;
    categoryName: string;
  }>;
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface FormItem {
  id: string;
  title: string;
  status: string;
  submittedAt: string;
  categoryName?: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadline: string;
  daysLeft: number;
  categoryName?: string;
}

// Re-export Report and ReportType to avoid duplicate references
export { Report, ReportType };
