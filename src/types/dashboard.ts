
import { BaseEntity } from './core';

// Status types
export type DashboardStatus = 'active' | 'pending' | 'completed' | 'draft';

// Common interfaces
export interface CategoryItem extends BaseEntity {
  name: string;
  description?: string;
  status: string;
  completionRate: number;
  completion?: number;
  deadline?: string;
  totalFields?: number;
  completedFields?: number;
  lastUpdated?: string;
}

export interface DeadlineItem extends BaseEntity {
  name: string;
  title?: string;
  dueDate: string;
  status: string;
  deadline: string;
  daysLeft: number;
  priority?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface RegionStat extends BaseEntity {
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface SectorStat extends BaseEntity {
  name: string;
  totalSchools: number;
  activeSchools: number;
  schoolCount?: number;
  completionRate: number;
  completion?: number;
  completion_rate?: number;
  status: string;
}

export interface SchoolStat extends BaseEntity {
  name: string;
  completionRate: number;
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  status: string;
  lastUpdated: string;
  totalEntries?: number;
  total_entries?: number;
  pendingEntries?: number;
  pending_entries?: number;
  pendingCount?: number;
  completion?: number;
  formsCompleted?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PendingApprovalItem extends BaseEntity {
  schoolName: string;
  regionName: string;
  categoryName: string;
  date: string;
  submittedAt?: string;
  submittedBy?: string;
  title?: string;
  count?: number;
}

// Alias for backward compatibility
export type PendingApproval = PendingApprovalItem;

export interface FormItem extends BaseEntity {
  name?: string;
  title?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  dueDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'not_started' | 'in_progress' | 'overdue';
  lastModified: string;
  completionRate?: number;
  progress?: number;
  submissions?: number;
}

export interface DashboardFormStats {
  completed: number;
  pending: number;
  total?: number;
  completedForms?: number;
  pendingForms?: number;
  approvalRate?: number;
  approved?: number;
  rejected?: number;
  draft?: number;
  dueSoon?: number;
  overdue?: number;
  percentage?: number;
  completion_rate?: number;
  completionRate?: number;
}

export interface StatsGridItem {
  title: string;
  value: string | number;
  color?: string;
  description?: string;
}

export interface DashboardChartProps {
  stats: DashboardFormStats;
  showLegend?: boolean;
  height?: number;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
  onCategoryChange?: (categoryId: string) => void;
}

// Role-specific dashboard data interfaces
export interface SuperAdminDashboardData {
  totalRegions: number;
  totalSectors: number;
  totalSchools: number;
  categories: CategoryItem[];
  pendingApprovals: PendingApprovalItem[];
  deadlines: DeadlineItem[];
  regionStats: RegionStat[];
}

export interface RegionAdminDashboardData {
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  sectors: SectorStat[];
}

export interface SectorAdminDashboardData {
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  schools: SchoolStat[];
}

export interface SchoolAdminDashboardData {
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  stats: DashboardFormStats;
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
  status?: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    active: number;
    inactive: number;
  };
  formStats?: DashboardFormStats;
  notifications?: any[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
}

// Dashboard component props
export interface DashboardProps {
  userRole: string;
  data: SuperAdminDashboardData | RegionAdminDashboardData | SectorAdminDashboardData | SchoolAdminDashboardData;
}

// Chart data interfaces
export interface ChartData {
  name: string;
  value: number;
  percentage?: number;
}

export interface CompletionChartData {
  category: string;
  completed: number;
  total: number;
  percentage: number;
}

// Notification interfaces
export interface NotificationItem extends BaseEntity {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
}

// Activity log interfaces
export interface ActivityLogItem extends BaseEntity {
  action: string;
  entityType: string;
  entityName: string;
  userEmail: string;
  timestamp: string;
}
