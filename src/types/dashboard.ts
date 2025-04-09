
import { Notification } from './notification';

export interface StatsItem {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export interface ChartData {
  activityData: Array<{ name: string; value: number }>;
  regionSchoolsData: Array<{ name: string; value: number }>;
  categoryCompletionData: Array<{ name: string; completed: number }>;
}

export interface FormItem {
  id: string;
  title: string;
  date: string;
  status: string;
  completionPercentage: number;
  category?: string; // Əlavə edildi
}

export type FormStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'completed' | 'dueSoon' | 'overdue';

export interface SchoolAdminDashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    dueSoon?: number; // Əlavə edildi
    overdue?: number; // Əlavə edildi
  };
  notifications: Notification[];
  completionRate: number;
  pendingForms: FormItem[];
  recentlySubmitted?: FormItem[];
  recentlyApproved?: FormItem[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface SectorAdminDashboardData {
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools?: number; // Əlavə edildi
  approvedSchools?: number; // Əlavə edildi
  rejectedSchools?: number; // Əlavə edildi
  notifications: Notification[];
  stats: StatsItem[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
  schoolStats?: {
    id: string;
    name: string;
    completionRate: number;
    pending: number;
  }[];
  pendingItems?: {
    id: string;
    school: string;
    category: string;
    date: string;
  }[];
}

export interface RegionAdminDashboardData {
  sectors: number;
  schools: number;
  users?: number; // Əlavə edildi
  completionRate: number;
  pendingApprovals: number;
  pendingSchools?: number; // Əlavə edildi
  approvedSchools?: number; // Əlavə edildi
  rejectedSchools?: number; // Əlavə edildi
  notifications: Notification[];
  stats: StatsItem[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
  sectorStats?: {
    id: string;
    name: string;
    schoolCount: number;
    completionRate: number;
  }[];
  sectorCompletions?: {
    id: string;
    name: string;
    schoolCount: number;
    completionPercentage: number;
  }[];
}

export interface SuperAdminDashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  stats: StatsItem[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
  regionStats?: {
    id: string;
    name: string;
    sectorCount: number;
    schoolCount: number;
    completionRate: number;
  }[];
}

export type DashboardData = SuperAdminDashboardData | RegionAdminDashboardData | SectorAdminDashboardData | SchoolAdminDashboardData;
