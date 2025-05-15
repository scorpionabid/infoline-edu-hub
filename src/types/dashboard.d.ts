
import { CategoryStatus } from './category';

export interface DashboardStatus {
  total: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  draft?: number;
  overdue?: number;
}

export interface DashboardFormStats {
  forms: number;
  pending: number;
  approved: number;
  draft: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  status: CategoryStatus;
  deadline?: string;
  completionRate?: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: CategoryStatus | string;
  deadline?: string;
  completionRate?: number;
}

export interface DeadlineItem {
  id: string;
  name: string;
  deadline: string;
  daysLeft: number;
}

export interface PendingApproval {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  submittedAt?: string;
  title: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
}

export interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  schoolCount: number;
}

export interface SchoolAdminDashboardData {
  status: DashboardStatus;
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  recentSubmissions?: FormItem[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  };
}

export interface SectorAdminDashboardData {
  status: DashboardStatus;
  categories: CategoryItem[];
  schools: SchoolStat[];
  pendingApprovals: PendingApproval[];
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
}

export interface RegionAdminDashboardData {
  status: DashboardStatus;
  sectors: SectorStat[];
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
}

export interface SuperAdminDashboardData {
  status: DashboardStatus;
  regions: {
    id: string;
    name: string;
    completionRate: number;
    sectorCount: number;
    schoolCount: number;
  }[];
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
}

export type DashboardData = 
  | SchoolAdminDashboardData
  | SectorAdminDashboardData
  | RegionAdminDashboardData
  | SuperAdminDashboardData;
