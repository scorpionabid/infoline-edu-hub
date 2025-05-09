
import { AppNotification } from './notification';
import { Category } from './category';

// Status data for dashboard
export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
  active: number;
  inactive: number;
}

// Completion data for dashboard
export interface DashboardCompletion {
  percentage: number;
  total: number;
  completed: number;
}

// Form statistics for dashboard
export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  draft?: number;
  total: number;
}

// Region statistics
export interface RegionStat {
  id: string;
  name: string;
  completionRate: number;
  sectorCount: number;
  schoolCount: number;
  status?: string;
}

// Sector statistics
export interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  schoolCount: number;
  pendingApprovals?: number;
  status?: string;
}

// School statistics
export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  pendingCount: number;
  status?: string;
}

// Base dashboard data interface
export interface BaseDashboardData {
  completion: DashboardCompletion;
  status: DashboardStatus;
  completionRate?: number;
  formStats?: DashboardFormStats;
  notifications?: AppNotification[];
}

// Super admin dashboard data
export interface SuperAdminDashboardData extends BaseDashboardData {
  totalRegions?: number;
  totalSectors?: number;
  totalSchools?: number;
  totalUsers?: number;
  regionStats?: RegionStat[];
  sectorStats?: SectorStat[];
  schoolStats?: SchoolStat[];
  pendingApprovals?: PendingApproval[];
}

// Region admin dashboard data
export interface RegionAdminDashboardData extends BaseDashboardData {
  totalSectors?: number;
  totalSchools?: number;
  regionCompletionRate?: number;
  sectorStats?: SectorStat[];
}

// Sector admin dashboard data
export interface SectorAdminDashboardData extends BaseDashboardData {
  totalSchools?: number;
  sectorCompletionRate?: number;
  schoolStats?: SchoolStat[];
  categories?: CategoryItem[];
}

// School admin dashboard data
export interface SchoolAdminDashboardData extends BaseDashboardData {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
}

// Category item for dashboard
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number;
  status?: string;
}

// Form item for dashboard
export interface FormItem {
  id: string;
  title?: string;
  name?: string;
  deadline?: string;
  status: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  completionRate?: number;
}

// Deadline item for dashboard
export interface DeadlineItem {
  id: string;
  title?: string;
  name?: string;
  deadline: string;
  daysLeft?: number;
  daysRemaining?: number;
  status?: string;
  categoryId?: string;
  dueDate?: string;
  progress?: number;
  completionRate?: number;
}

// Pending approval for dashboard
export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  status: string;
  createdAt?: string;
  submittedAt: string;
  count?: number;
  entries?: any[];
}

// Chart data
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// Props for SuperAdminDashboard component
export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

// Props for FormTabs component
export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

// Re-export SchoolStat for component usage
export { SchoolStat };
