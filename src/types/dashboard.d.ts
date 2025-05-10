
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
  sectorStats: SectorStat[];
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
  
  // These were flagged as missing in the errors
  notifications: any[];
  status: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
  formStats: DashboardFormStats;
  upcoming: any[];
  pendingForms: any[];
  completionRate?: number;
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
  // These were missing
  status: any;
  formStats: DashboardFormStats;
  categories: any[];
  upcoming: any[];
  pendingForms: any[];
  schoolStats: any[];
  pendingApprovals: any[];
}

// Missing dashboard types
export interface PendingApproval {
  id: string;
  name: string;
  school: string;
  category: string;
  submittedBy: string;
  submittedAt: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  totalEntries: number;
  pendingEntries: number;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface FormItem {
  id: string;
  name: string;
  category: string;
  dueDate: string;
  status: string;
}

export interface DeadlineItem {
  id: string;
  name: string;
  deadline: string;
  daysLeft: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  completion: number;
  status: string;
}

export interface StatusCardsProps {
  data: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
}

export type DashboardStatus = {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
};
