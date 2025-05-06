
import { DashboardNotification } from './notification';

export interface FormItem {
  id: string;
  name?: string;
  title: string;
  status: string;
  categoryName?: string;
  dueDate?: string;
  createdAt?: string;
  completionRate?: number;
}

export interface FormDeadline extends FormItem {
  // FormDeadline artıq FormItem'in xüsusiyyətlərinə sahib olacaq
}

export interface RecentForm extends FormItem {
  // RecentForm da FormItem'dən genişlənir
  categoryId?: string;
}

export interface SchoolStats {
  id: string;
  name: string;
  completionRate?: number;
  formsCompleted?: number;
  formsTotal?: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate?: number;
  formsCompleted?: number;
  formsTotal?: number;
  address?: string;
}

export interface SchoolAdminDashboardData {
  formStats?: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    incomplete: number;
    dueSoon: number;
    overdue: number;
  };
  recentForms?: FormItem[];
  upcomingDeadlines?: FormItem[];
  completionRate?: number;
  notifications?: any[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  };
  status?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  categories?: any[];
  upcoming?: any[];
  forms?: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingForms?: any[];
}

export interface SuperAdminDashboardData {
  stats: {
    totalUsers: number;
    totalSchools: number;
    totalRegions: number;
    totalSectors: number;
  };
  formsByStatus: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    submitted: number;
  };
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
    totalSchools: number;
    totalSectors: number;
    totalForms: number;
    totalCategories: number;
  };
  sectorStats: any[];
  schoolStats: any[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: string;
}

export interface SectorAdminDashboardData {
  statistics: {
    totalSchools: number;
    activeSchools: number;
    pendingSubmissions: number;
    completedSubmissions: number;
  };
  schools: SchoolDashboardData[];
}

export interface SchoolDashboardData {
  id: string;
  name: string;
  formsCompleted: number;
  totalForms: number;
  completionRate: number;
  lastSubmission?: string;
}

// PendingApproval tipi
export interface PendingApprovalItem {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  submittedAt: string;
  status: string;
}
