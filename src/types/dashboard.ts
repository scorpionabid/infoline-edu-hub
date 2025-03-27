
import { Notification, NotificationType } from './notification';
import { FormStatus } from './form';

export interface FormItem {
  id: string;
  title: string;
  category: string;
  status: FormStatus;
  completionPercentage: number;
  deadline?: string;
}

export interface DashboardData {
  totalSchools: number;
  activeSchools: number;
  pendingForms: FormItem[];
  upcomingDeadlines: {
    category: string;
    date: string;
  }[];
  regionalStats: {
    region: string;
    approved: number;
    pending: number;
    rejected: number;
  }[];
  sectorStats: {
    sector: string;
    approved: number;
    pending: number;
    rejected: number;
  }[];
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  activityData?: {
    id: string;
    action: string;
    actor: string;
    target: string;
    time: string;
  }[];
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
  statusData?: {
    completed: number;
    pending: number;
    rejected: number;
    notStarted: number;
  };
}

export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
  categories: {
    name: string;
    completionRate: number;
    color: string;
  }[];
  sectorCompletions: {
    name: string;
    completionRate: number;
  }[];
}

export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName: string;
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
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
  totalForms?: number;
  completedForms?: number;
  rejectedForms?: number;
  dueDates?: Array<{
    category: string;
    date: string;
  }>;
  recentForms?: Array<FormItem>;
}

export interface ChartData {
  activityData: { name: string; value: number }[];
  regionSchoolsData: { name: string; value: number }[];
  categoryCompletionData: { name: string; completed: number }[];
}

export type { FormStatus };
