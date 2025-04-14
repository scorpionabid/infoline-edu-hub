
import { Notification } from './notification';

export interface DashboardNotification extends Omit<Notification, 'date'> {
  date: string;
}

export interface StatsItem {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export interface RegionStat {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  completionRate: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  color: string;
}

export interface SectorCompletion {
  id: string;
  name: string;
  completionRate: number;
  schoolCount: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  pending: number;
}

export interface PendingItem {
  id: string;
  school: string;
  category: string;
  date: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  target: string;
  time: string;
}

export interface FormItem {
  id: string;
  title: string;
  category?: string;
  status: 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue';
  completionPercentage: number;
  date: string;
  description?: string;
}

export interface ChartData {
  activityData: Array<{ name: string; value: number }>;
  regionSchoolsData: Array<{ name: string; value: number }>;
  categoryCompletionData: Array<{ name: string; completed: number }>;
}

export interface SuperAdminDashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: DashboardNotification[];
  stats: StatsItem[];
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  regionStats: RegionStat[];
}

export interface RegionAdminDashboardData {
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: DashboardNotification[];
  stats: StatsItem[];
  categories: CategoryStat[];
  sectorCompletions: SectorCompletion[];
}

export interface SectorAdminDashboardData {
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: DashboardNotification[];
  stats: StatsItem[];
  schoolStats: SchoolStat[];
  pendingItems: PendingItem[];
  categoryCompletion: CategoryStat[];
  activityLog: ActivityLogItem[];
}

export interface SchoolAdminDashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    dueSoon: number;
    overdue: number;
  };
  completionRate: number;
  notifications: DashboardNotification[];
  pendingForms: FormItem[];
}

export type DashboardData = 
  | SuperAdminDashboardData 
  | RegionAdminDashboardData 
  | SectorAdminDashboardData 
  | SchoolAdminDashboardData;
