
import { Notification } from './notification';

export interface FormStatus {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueSoon: number;
}

export interface FormItem {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'overdue';
  deadline?: string;
  completionRate?: number;
}

export interface ChartData {
  activityData: { name: string; value: number }[];
  regionSchoolsData: { name: string; value: number }[];
  categoryCompletionData: { name: string; completed: number }[];
}

export interface DashboardData {
  isLoading?: boolean;
  error?: Error | null;
  notifications?: Notification[];
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
}

export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: number;
  schools: number;
  approvalRate: number;
}

export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName: string;
  schools: number;
  pendingApprovals: number;
}

export interface SchoolAdminDashboardData extends DashboardData {
  schoolName: string;
  sectorName: string;
  regionName: string;
  completionRate: number;
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  recentForms: FormItem[];
}

export type UserDashboard = SuperAdminDashboardData | RegionAdminDashboardData | SectorAdminDashboardData | SchoolAdminDashboardData;
