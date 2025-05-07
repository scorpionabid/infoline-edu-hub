
// Dashboard komponentləri üçün ümumi tiplər
import { DashboardNotification } from './notification';

// -------------- Ümumi İnterfeyslər --------------
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
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  incomplete?: number;
  dueSoon?: number;
  overdue?: number;
  submitted?: number;
}

// Approval tipləri
export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  category: string;
  submittedAt: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type PendingApprovalItem = PendingApproval;

// -------------- Dashboard Məlumat Tipləri --------------
export interface SuperAdminDashboardData {
  stats: DashboardStats;
  formsByStatus: FormStats;
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface RegionAdminDashboardData {
  stats: DashboardStats;
  sectorStats: SectorStat[];
  schoolStats: SchoolStat[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface SectorAdminDashboardData {
  statistics: {
    totalSchools: number;
    activeSchools: number;
    pendingSubmissions: number;
    completedSubmissions: number;
  };
  schools: SchoolStat[];
}

export interface SchoolAdminDashboardData {
  formStats: FormStats;
  recentForms: FormItem[];
  upcomingDeadlines: DeadlineItem[];
  completionRate: number;
  notifications: DashboardNotification[];
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
  forms?: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
}

// -------------- Köməkçi İnterfeyslər --------------
export interface CategoryStat {
  id: string;
  name: string;
  deadline: string;
  completionRate: number;
  totalSchools: number;
  completedSchools: number;
}

export interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  schoolsCount: number;
  pendingApprovals: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  lastUpdate: string;
  pendingForms: number;
  principal?: string;
  formsCompleted?: number;
  formsTotal?: number;
  totalForms?: number; 
  address?: string;
  phone?: string;
  email?: string;
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'submitted';
  deadline?: string;
  dueDate?: string;
  category: string;
  categoryName?: string;
  lastUpdate: string;
  createdAt?: string;
  completionRate?: number;
}

export interface DeadlineItem {
  id: string;
  category: string;
  categoryName?: string;
  deadline: string;
  daysRemaining: number;
  completionRate: number;
  name?: string;
  title?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
}

// Status Cards Props
export interface StatusCardsProps {
  formStats?: FormStats;
  pending?: number;
  approved?: number;
  rejected?: number;
  draft?: number;
  dueSoon?: number;
  overdue?: number;
}
