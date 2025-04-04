
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
  statusData?: any;
  categoryCompletionData?: any[];
  recentForms?: FormItem[];
  chartData?: any;
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
  categoryCompletion?: any[];
  statusDistribution?: any[];
  users?: number;
  statusData?: any;
  chartData?: any;
  categoryCompletionData?: any[];
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
  users?: number;
  statusData?: any;
  recentForms?: FormItem[];
  upcomingDeadlines?: any[];
  chartData?: any;
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
  completedForms: FormItem[];
  totalForms?: number;
  upcomingDeadlines?: any[];
  statusData?: any;
  chartData?: any;
}
