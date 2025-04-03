
import { FormItem, FormStatus } from './form';
import { Notification } from './notification';

export interface ActivityItem {
  id: string;
  action: string;
  actor: string;
  target: string;
  time: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
  activityData?: any;
}

export interface StatusData {
  completed: number;
  pending: number;
  rejected: number;
  notStarted: number;
}

export interface CategoryCompletionData {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

// Base Dashboard Data
export interface DashboardData {
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
  completionRate?: number;
  pendingApprovals?: number;
  notifications?: Notification[];
  activityData?: ActivityItem[];
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
  statusData?: StatusData;
  chartData?: ChartData;
  categoryCompletionData?: CategoryCompletionData[];
  pendingForms?: FormItem[];
}

// SuperAdmin Dashboard Data
export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  statusData: StatusData;
  categoryCompletionData: CategoryCompletionData[];
  recentForms?: FormItem[];
  pendingForms?: FormItem[];
}

// RegionAdmin Dashboard Data
export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: number;
  schools: number;
  users: number;
  approvalRate: number;
  completionRate: number;
  statusData: StatusData;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  sectorCompletions?: any[];
  recentForms?: FormItem[];
  pendingForms?: FormItem[];
  upcomingDeadlines?: FormItem[];
}

// SectorAdmin Dashboard Data
export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName?: string;
  schools: number;
  users: number;
  completionRate: number;
  statusData: StatusData;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  recentForms?: FormItem[];
  pendingForms?: FormItem[];
  upcomingDeadlines?: FormItem[];
}

// SchoolAdmin Dashboard Data
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
  pendingForms?: FormItem[];
  completedForms?: number;
  totalForms?: number;
  upcomingDeadlines?: FormItem[];
}
