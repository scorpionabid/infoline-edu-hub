
import { Notification } from '@/types/notification';
import { School } from '@/types/school';
import { Sector } from '@/types/sector';
import { Region } from '@/types/region';
import { Category } from '@/types/category';

export interface DashboardData {
  stats: {
    totalSchools: number;
    totalRegions: number;
    totalSectors: number;
    totalCategories: number;
    totalUsers: number;
  };
  completionRate: number;
  notifications: Notification[];
  activityData?: ActivityItem[];
  pendingForms?: FormItem[];
  recentForms?: FormItem[];
}

export interface SuperAdminDashboardData extends DashboardData {
  recentSchools: School[];
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  regionStats: { name: string; schoolCount: number }[];
  categoryCompletions: CategoryCompletionData[];
  statusCounts: { [key: string]: number };
  regionSchoolsData?: any[];
}

export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  recentSectors: Sector[];
  pendingSectors: number;
  approvedSectors: number;
  rejectedSectors: number;
  sectorStats: { name: string; schoolCount: number }[];
  categoryCompletions: CategoryCompletionData[];
  statusCounts: { [key: string]: number };
  statusData?: any[];
}

export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName: string;
  recentSchools: School[];
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  schoolStats: { name: string; completionRate: number }[];
  categoryCompletions: CategoryCompletionData[];
  statusCounts: { [key: string]: number };
  statusData?: any[];
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
  completedForms?: FormItem[];
  pendingForms?: FormItem[];
  recentForms?: FormItem[];
  categoryCompletions: CategoryCompletionData[];
  unsubmittedCount: number;
  dueSoonCount: number;
  overdueCount: number;
}

export interface CategoryCompletionData {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface ChartData {
  categoryCompletion: {
    categories: string[];
    percentages: number[];
  };
  statusDistribution: {
    labels: string[];
    values: number[];
  };
  schoolsPerRegion?: {
    regions: string[];
    counts: number[];
  };
  monthlySubmissions?: {
    months: string[];
    counts: number[];
  };
  regionSchoolsData?: any[];
  activityData?: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'form_submission' | 'form_approval' | 'form_rejection' | 'category_creation' | 'other';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userName?: string;
  entityId?: string;
  entityType?: string;
}

export interface FormItem {
  id: string;
  title: string;
  categoryId: string;
  status: FormStatus;
  completionPercentage: number;
  deadline: string;
  filledCount: number;
  totalCount: number;
}

export type FormStatus = 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon' | 'draft' | 'inProgress';
