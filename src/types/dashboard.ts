
import { Notification } from './notification';
import { FormItem } from './form';
export type { FormItem } from './form';

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  action: string;
  actor: string;
  target: string;
  time: string;
}

export interface DashboardData {
  notifications: Notification[];
  activityData?: ActivityItem[];
  pendingForms?: FormItem[];
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
}

export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: number;
  schools: number;
  approvalRate: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
}

export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName: string;
  schools: number;
  pendingApprovals: number;
  completionRate: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
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
  recentForms?: FormItem[];
  dueSoonForms?: FormItem[];
  overdueForms?: FormItem[];
  pendingForms: FormItem[];
  completedForms: FormItem[] | number; // Burası ya FormItem[] ya da number olabilir
}
