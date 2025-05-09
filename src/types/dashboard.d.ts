
import { AppNotification } from './notification';

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
  active: number;
  inactive: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

export interface CompletionStats {
  total: number;
  completed: number;
  percentage: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number;
  status?: string;
}

export interface DeadlineItem {
  id: string;
  name?: string;
  title?: string;
  categoryId?: string;
  daysLeft?: number;
  daysRemaining?: number;
  status?: string;
  categoryName?: string;
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  status?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface SchoolAdminDashboardData {
  completion: CompletionStats;
  status: DashboardStatus;
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  formStats?: DashboardFormStats;
  pendingForms: FormItem[];
  completionRate: number;
  notifications: any[];
}

export interface SuperAdminDashboardProps {
  data: {
    completion: CompletionStats;
    regionStats?: any[];
    sectorStats?: any[];
    schoolStats?: any[];
    status?: DashboardStatus;
    totalRegions?: number;
    totalSectors?: number;
    totalSchools?: number;
  };
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}
