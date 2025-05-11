
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
  description?: string;
}

export interface RegionData {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  adminName?: string;
  completionRate: number;
}

// Add FormTabsProps interface
export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
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
  pendingApprovals: PendingApproval[];
}

export interface SchoolAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    active: number;
    inactive: number;
  };
  categories: CategoryItem[];
  categoryData: CategoryProgressData[];
  recentActivities: any[];
  formStats: DashboardFormStats;
  notifications: AppNotification[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
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
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  categoryData: CategoryProgressData[];
  schoolData: SchoolCompletionData[];
  recentActivities: any[];
  status: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    active: number;
    inactive: number;
  };
  formStats: DashboardFormStats;
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApproval[];
}

// Export PendingApproval interface (enhanced)
export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  submittedBy?: string;
  submittedAt: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  title?: string;
  count?: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  totalEntries?: number;
  pendingEntries?: number;
  pendingCount?: number;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  dueDate?: string;
  status: string;
}

export interface DeadlineItem {
  id: string;
  name?: string;
  title?: string;
  deadline: string;
  daysLeft?: number;
  category?: string;
  categoryId?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  completionRate: number;
  status: string;
  deadline?: string;
}

export interface StatusCardsProps {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total?: number;
  };
  formStats?: DashboardFormStats;
}

export type DashboardStatus = {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total?: number;
  active?: number;
  inactive?: number;
};

// Import for AppNotification
import { AppNotification } from '@/types/notification';
