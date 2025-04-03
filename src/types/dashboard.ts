
import { FormItem } from './form';
import { Notification } from './notification';
import { School } from './school';
import { Region } from './region';
import { Sector } from './sector';
import { User } from './user';

export interface DashboardData {
  notifications: Notification[];
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  approvalRate: number;
  pendingApprovals: number;
  categoryCompletionData: CategoryCompletionData[];
  regionCompletionData: RegionCompletionData[];
  recentSchools: School[];
  recentRegions: Region[];
  recentSectors: Sector[];
  recentUsers: User[];
  mostActiveRegions: RegionActivityData[];
  recentForms?: FormItem[];
}

export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  approvalRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  categoryCompletionData: CategoryCompletionData[];
  sectorCompletionData: SectorCompletionData[];
  recentSchools: School[];
  recentSectors: Sector[];
  recentUsers: User[];
  recentForms?: FormItem[];
  upcomingDeadlines?: FormItem[];
}

export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName?: string;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  categoryCompletionData: CategoryCompletionData[];
  schoolCompletionData: SchoolCompletionData[];
  recentSchools: School[];
  recentUsers: User[];
  recentForms?: FormItem[];
  upcomingDeadlines?: FormItem[];
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
  categories: number;
  pendingCategories: number;
  approvedCategories: number;
  rejectedCategories: number;
  recentForms: FormItem[];
  upcomingDeadlines?: FormItem[];
  completedForms?: FormItem[];
}

export interface CategoryCompletionData {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface SectorCompletionData {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface SchoolCompletionData {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface RegionCompletionData {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface RegionActivityData {
  name: string;
  activity: number;
}

export interface ChartData {
  categoryCompletionData?: CategoryCompletionData[];
  regionCompletionData?: RegionCompletionData[];
  sectorCompletionData?: SectorCompletionData[];
  schoolCompletionData?: SchoolCompletionData[];
  regionSchoolsData?: Array<{ name: string; value: number }>;
}
