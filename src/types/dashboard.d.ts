
import { DashboardNotification, Notification } from './notification';

export interface FormItem {
  id: string;
  name: string;
  title: string;
  status: string;
  categoryName: string;
  dueDate: string;
  createdAt: string;
  completionRate: number;
}

export interface FormDeadline extends FormItem {
  // FormDeadline artıq FormItem'in bütün xüsusiyyətlərinə sahib olacaq
}

export interface RecentForm extends FormItem {
  categoryId?: string;
}

export interface SchoolStats {
  id: string;
  name: string;
  completionRate: number;
  formsCompleted: number;
  formsTotal: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  formsCompleted: number;
  totalForms: number;
  address?: string;
  completion_rate?: number;
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
  recentForms?: RecentForm[];
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

export interface DashboardStatistics {
  totalItems: number;
  activeItems: number;
  completedItems: number;
  pendingItems: number;
}

export interface DashboardStats {
  totalUsers?: number;
  totalSchools?: number;
  totalRegions?: number;
  totalSectors?: number;
  totalForms?: number;
  totalCategories?: number;
  sectors?: number;
  schools?: number;
  users?: number;
}

export interface FormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  submitted?: number;
  incomplete?: number;
  dueSoon?: number;
  overdue?: number;
}
