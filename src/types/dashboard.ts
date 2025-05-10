
import { Category } from './category';
import { Region, EnhancedRegion } from '@/hooks/regions/useRegions';

export interface DashboardFormStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  draft: number;
}

export interface SchoolCompletionData {
  id: string;
  name: string;
  completionRate: number;
  totalEntries: number;
  pendingEntries: number;
  region?: string;
}

export interface CategoryProgressData {
  id: string;
  name: string;
  completionRate: number;
  deadline?: string;
  status?: string;
}

export interface RegionData {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  adminName?: string;
  completionRate: number;
}

export interface SuperAdminDashboardData {
  users: {
    active: number;
    total: number;
    new: number;
  };
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  entryCount: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
  };
  completion: number;
  categoryData: CategoryProgressData[];
  schoolData: SchoolCompletionData[];
  regionData: RegionData[];
}

export interface RegionAdminDashboardData {
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  sectors: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    admins: number;
    teachers: number;
  };
  entryCount: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  completion: number;
  categoryData: CategoryProgressData[];
  schoolData: SchoolCompletionData[];
  recentActivities: any[];
}

export interface SchoolAdminDashboardData {
  categories: {
    total: number;
    completed: number;
    pending: number;
    draft: number;
  };
  entryCount: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
  };
  completion: number;
  categoryData: CategoryProgressData[];
  recentActivities: any[];
}

export interface SectorAdminDashboardData {
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    admins: number;
    teachers: number;
  };
  entryCount: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  completion: number;
  categoryData: CategoryProgressData[];
  schoolData: SchoolCompletionData[];
  recentActivities: any[];
}
