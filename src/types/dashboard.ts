
import { Notification } from './notification';
import { FormItem } from './form';

export interface ChartData {
  activityData: { name: string; value: number }[];
  regionSchoolsData: { name: string; value: number }[];
  categoryCompletionData: { name: string; completed: number }[];
}

export interface DashboardData {
  userId: string;
  userName?: string;
  isLoading: boolean;
  error: Error | null;
  notifications?: Notification[];
  totalSchools?: number; // Əlavə edildi
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  pendingSchools?: number; // Əlavə edildi
  approvedSchools?: number; // Əlavə edildi
  rejectedSchools?: number; // Əlavə edildi
}

export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: number;
  schools: number;
  approvalRate: number;
  notifications: Notification[];
  completionRate?: number;
  pendingApprovals?: number;
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
  users?: number; // Əlavə edildi
}

export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName: string;
  schools: number;
  pendingApprovals: number;
  notifications: Notification[];
  completionRate?: number; // Əlavə edildi
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
}

export interface SchoolAdminDashboardData extends DashboardData {
  schoolName: string;
  sectorName: string;
  regionName: string;
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  completionRate: number;
  notifications: Notification[];
  categories?: number;
  totalForms?: number; // Əlavə edildi
  completedForms?: number;
  pendingForms: FormItem[]; // Əlavə edilib
  rejectedForms?: number;
  dueDates?: Array<{
    category: string;
    date: string;
  }>;
  recentForms?: FormItem[];
}
