
import { Category } from './category';
import { Region } from '@/hooks/regions/useRegions';
import { AppNotification } from '@/types/notification';

export interface DashboardFormStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  draft: number;
}

export interface DashboardStatus {
  pending?: number;
  approved?: number;
  rejected?: number;
  draft?: number;
  total?: number;
  active?: number;
  inactive?: number;
}

// Status Cards props definition
export interface StatusCardsProps {
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
}

// CategoryItem interface - used for dashboard category listings
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  completionRate: number;
  status: string;
  deadline?: string;
}

// FormItem interface - used for pending forms listings
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

// DeadlineItem interface - used for upcoming deadlines
export interface DeadlineItem {
  id: string;
  name?: string;
  title?: string;
  deadline: string;
  daysLeft?: number;
  category?: string;
  categoryId?: string;
  categoryName?: string;
}

// PendingApproval interface - used for approval workflows
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
  date?: string;
}

// SchoolStat interface - used for school statistics
export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  totalEntries?: number;
  pendingEntries?: number;
  pendingCount?: number;
  completion?: number;
  status?: string;
  lastUpdate?: string;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
  pendingForms?: number;
}

// SectorStat interface - used for sector statistics
export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
  completion?: number;
}

// FormTabsProps definition
export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

// Category progress data
export interface CategoryProgressData {
  id: string;
  name: string;
  completionRate: number;
  deadline?: string;
  status?: string;
  description?: string;
}

// School completion data
export interface SchoolCompletionData {
  id: string;
  name: string;
  completionRate: number;
  totalEntries: number;
  pendingEntries: number;
  region?: string;
}

// Region data
export interface RegionData {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  adminName?: string;
  completionRate: number;
}

// Base dashboard data interface that all admin dashboards extend
export interface BaseDashboardData {
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
  completionRate?: number;
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  notifications?: AppNotification[];
  categories?: CategoryItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
}

// School Admin Dashboard Data
export interface SchoolAdminDashboardData extends BaseDashboardData {
  categoryData?: CategoryProgressData[];
  recentActivities?: any[];
}

// Sector Admin Dashboard Data
export interface SectorAdminDashboardData extends BaseDashboardData {
  schools?: {
    total: number;
    active: number;
    inactive: number;
  };
  users?: {
    total: number;
    admins: number;
    teachers: number;
  };
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  schoolData?: SchoolCompletionData[];
  recentActivities?: any[];
  schoolStats?: SchoolStat[];
  pendingApprovals?: PendingApproval[];
}

// Region Admin Dashboard Data
export interface RegionAdminDashboardData extends BaseDashboardData {
  schools?: {
    total: number;
    active: number;
    inactive: number;
  };
  sectors?: {
    total: number;
    active: number;
    inactive: number;
  };
  users?: {
    total: number;
    admins: number;
    teachers: number;
  };
  stats?: {
    sectors: number;
    schools: number;
    users: number;
  };
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  categoryData?: CategoryProgressData[];
  schoolData?: SchoolCompletionData[];
  recentActivities?: any[];
  sectorStats?: SectorStat[];
  pendingApprovals?: PendingApproval[];
  pendingItems?: any[];
}

// Super Admin Dashboard Data
export interface SuperAdminDashboardData extends BaseDashboardData {
  users?: {
    active: number;
    total: number;
    new: number;
  };
  stats?: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount?: number;
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
  };
  approvalRate?: number;
  categoryData?: CategoryProgressData[];
  schoolData?: SchoolCompletionData[];
  regionData?: RegionData[];
  regions?: any[];
  pendingApprovals?: PendingApproval[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}
