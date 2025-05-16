
import { AppNotification } from './notification';

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  active?: number;
  inactive?: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  total: number;
  forms?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  completionRate: number;
  status: string;
  deadline?: string;
  daysLeft?: number;
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  status: string;
  category?: string;
  categoryName?: string;
  categoryId?: string;
  lastUpdate?: string;
  dueDate?: string;
  createdAt?: string;
}

export interface DeadlineItem {
  id: string;
  name?: string;
  title?: string;
  deadline?: string;
  daysLeft?: number;
  status?: 'upcoming' | 'overdue' | 'completed' | 'pending' | 'draft';
}

export interface PendingApproval {
  id: string;
  title?: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  submittedAt?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status?: string;
  totalEntries?: number;
  pendingEntries?: number;
  pendingCount?: number;
  pendingForms?: number;
  lastUpdate?: string;
  formsCompleted?: number;
  totalForms?: number;
}

export interface SectorStat {
  id: string;
  name: string;
  completionRate?: number;
  completion?: number;
  schoolCount?: number;
  totalEntries?: number;
  completedEntries?: number;
}

export interface SchoolAdminDashboardData {
  completionRate?: number;
  completion?: number | {
    percentage: number;
    total: number;
    completed: number;
  };
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  notifications?: AppNotification[];
}

export interface SectorAdminDashboardData {
  schools?: {
    total: number;
    active: number;
    inactive: number;
  };
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  pendingApprovals?: PendingApproval[];
  schoolStats?: SchoolStat[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
}

export interface RegionAdminDashboardData {
  sectorStats?: SectorStat[];
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  pendingApprovals?: PendingApproval[];
}

export interface SuperAdminDashboardData {
  activeUsers?: number;
  totalRegions?: number;
  totalSectors?: number;
  totalSchools?: number;
  approvedEntries?: number;
  pendingEntries?: number;
  rejectedEntries?: number;
  dueSoonEntries?: number;
  overdueEntries?: number;
  draftEntries?: number;
  completionRate?: number;
  categories?: CategoryItem[];
  schools?: SchoolStat[];
  users?: {
    active: number;
    total: number;
    new?: number;
  };
  regionCount?: number;
  sectorCount?: number;
  schoolCount?: number;
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon?: number;
    overdue?: number;
    draft?: number;
  };
  completion?: number | {
    percentage: number;
    total: number;
    completed: number;
  };
  categoryData?: any[];
  schoolData?: any[];
  regionData?: any[];
}

export interface StatusCardsProps {
  completion?: number | {
    percentage: number;
    total: number;
    completed: number;
  };
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}
