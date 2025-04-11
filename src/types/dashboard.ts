
import { Notification } from './notification';
import { FormStatus } from './form';

export interface FormItem {
  id: string;
  title: string;
  date: string;
  status: FormStatus;
  completionPercentage: number;
  category?: string;
  deadline?: string;
}

export interface FormCount {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  dueSoon: number;
  overdue: number;
}

export interface FormStatusCount {
  pending: number;
  approved: number;
  rejected: number;
}

export interface SchoolAdminDashboardData {
  forms: FormCount;
  notifications: Notification[];
  completionRate: number;
  pendingForms: FormItem[];
  formsByStatus?: FormStatusCount;
}

export interface EntityCount {
  total: number;
  active: number;
  inactive: number;
}

export interface UserEntityCount extends EntityCount {
  byRole: {
    superadmin: number;
    regionadmin: number;
    sectoradmin: number;
    schooladmin: number;
  };
}

export interface RegionAdminDashboardData {
  sectors: EntityCount;
  schools: EntityCount;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
  notifications: Notification[];
  stats: StatsItem[];
  sectorCompletions?: Array<{
    id: string;
    name: string;
    schoolCount: number;
    completionPercentage: number;
  }>;
}

export interface SuperAdminDashboardData {
  regions: EntityCount;
  sectors: EntityCount;
  schools: EntityCount;
  users: UserEntityCount;
  statistics?: {
    completionRate: number;
    submissionRate?: number;
    approvalRate?: number;
  };
  completionRate?: number;
  pendingApprovals?: number;
  notifications: Notification[];
  stats?: StatsItem[];
  formsByStatus?: FormStatusCount;
  regionStats?: Array<{
    id: string;
    name: string;
    sectorCount: number;
    schoolCount: number;
    completionRate: number;
  }>;
}

export interface SectorAdminDashboardData {
  schools: EntityCount;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
  notifications: Notification[];
  stats: StatsItem[];
  schoolStats?: Array<{
    id: string;
    name: string;
    completionRate: number;
    pending: number;
  }>;
}

export interface DashboardData {
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
  completionRate?: number;
  pendingApprovals?: number;
  notifications?: Notification[];
  stats?: StatsItem[];
  superAdmin?: SuperAdminDashboardData;
  regionAdmin?: RegionAdminDashboardData;
  sectorAdmin?: SectorAdminDashboardData;
  schoolAdmin?: SchoolAdminDashboardData;
}

export interface StatsItem {
  id: string;
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  label?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartData {
  activityData: {
    name: string;
    value: number;
  }[];
  regionSchoolsData: {
    name: string;
    value: number;
  }[];
  categoryCompletionData: {
    name: string;
    value: number;
  }[];
}
