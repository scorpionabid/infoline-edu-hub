
import { DashboardNotification, Notification } from './notification';
import { School } from './school';

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

export interface FormDeadline {
  id: string;
  name: string;
  deadline: string;
  daysLeft: number;
}

// SuperAdmin Dashboard
export interface SuperAdminDashboardData {
  stats: DashboardStats;
  formsByStatus: FormStats;
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

// RegionAdmin Dashboard
export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  formsCompleted: number;
  totalForms: number;
  completionRate: number;
}

export interface RegionAdminDashboardData {
  stats: DashboardStats;
  sectorStats: SectorStat[];
  schoolStats: SchoolStat[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

// SectorAdmin Dashboard
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

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

// SchoolAdmin Dashboard
export interface RecentForm {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  submittedAt?: string;
  categoryId: string;
}

export interface SchoolAdminDashboardData {
  formStats: FormStats;
  recentForms: RecentForm[];
  upcomingDeadlines: FormDeadline[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading: boolean;
}
