
import { School } from './school';
import { Region } from './region';
import { Sector } from './types/sector';
import { Category } from './category';
import { Column } from './column';
import { DashboardNotification } from './notification';

// Dashboard statistikaları
export interface DashboardStats {
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
  totalRegions?: number;
  totalSectors?: number;
  totalSchools?: number;
  totalUsers?: number;
}

export interface RegionStats {
  total: number;
  active: number;
  inactive: number;
}

export interface SectorStats {
  total: number;
  active: number;
  inactive: number;
  length?: number;
}

export interface SchoolStats {
  total: number;
  active: number;
  incomplete: number;
  complete: number;
  id?: string;
  name?: string;
  address?: string;
  completionRate?: number;
  formsCompleted?: number;
  formsTotal?: number;
}

export interface FormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  submitted?: number;
  incomplete?: number;
  dueSoon?: number;
  overdue?: number;
}

export interface PendingApprovalItem {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  deadline?: string;
  submittedAt?: string;
  date?: string;
  completedFields?: number;
  totalFields?: number;
  completionRate?: number;
  categoryName?: string;
  dueDate?: string;
  createdAt?: string;
  lastUpdated?: string;
}

// SuperAdmin Dashboard data
export interface SuperAdminDashboardData {
  stats: DashboardStats;
  regionStats?: RegionStats;
  sectorStats?: SectorStats;
  schoolStats?: SchoolStats;
  formsByStatus?: FormStats;
  recentActivities?: any[];
  topRegions?: {
    id: string;
    name: string;
    completionRate: number;
  }[];
  topSectors?: {
    id: string;
    name: string;
    completionRate: number;
  }[];
  completionRate: number;
  notifications?: any[];
  pendingApprovals?: PendingApprovalItem[];
  forms?: FormStats;
  regions?: RegionStats;
  sectors?: SectorStats;
  schools?: SchoolStats;
}

// Region Admin Dashboard data
export interface RegionAdminDashboardData {
  stats?: {
    sectors: number;
    schools: number;
    users: number;
    totalSectors?: number;
    totalSchools?: number;
    totalForms?: number;
    totalCategories?: number;
  };
  sectorStats?: SectorStats[];
  schoolStats?: SchoolStats[];
  recentActivities?: any[];
  completionRate?: number;
  notifications?: any[];
  pendingApprovals?: PendingApprovalItem[];
  formStats?: FormStats;
}

// School Admin Dashboard data
export interface SchoolAdminDashboardData {
  stats?: {
    categories?: number;
    forms?: number;
    columns?: number;
  };
  formStats?: FormStats;
  recentForms?: FormItem[];
  completionRate?: number;
  notifications?: any[];
  categories?: {
    id: string;
    name: string;
    status: string;
    completionRate: number;
  }[];
  upcomingDeadlines?: FormItem[];
}
