
import { BaseEntity } from './core';

// Form item status types  
export type FormItemStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'not_started' | 'in_progress' | 'overdue' | 'draft';

// Category status types
export type CategoryStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'not_started' | 'in_progress' | 'overdue' | 'active' | 'inactive';

// Deadline status types
export type DeadlineStatus = 'completed' | 'overdue' | 'upcoming' | 'on_track';

// School/Sector status types
export type EntityStatus = 'active' | 'inactive' | 'on_track' | 'needs_attention';

export interface FormItem extends BaseEntity {
  name: string;
  title?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  status: FormItemStatus;
  lastModified: string;
  completionRate: number;
  progress?: number;
  dueDate?: string;
}

export interface CategoryItem extends BaseEntity {
  name: string;
  description?: string;
  status: CategoryStatus;
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
  deadline: string;
  dueDate: string;
  status: DeadlineStatus;
  daysLeft: number;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface PendingApproval extends BaseEntity {
  schoolName: string;
  categoryName: string;
  date: string;
  submittedAt?: string;
  submittedBy?: string;
  status: 'pending';
  title?: string;
  count?: number;
}

export interface SchoolStat extends BaseEntity {
  name: string;
  completionRate: number;
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  status: EntityStatus;
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

export interface SectorStat extends BaseEntity {
  name: string;
  schoolCount: number;
  totalSchools: number;
  activeSchools: number;
  completionRate: number;
  status: EntityStatus;
  completion?: number;
  completion_rate?: number;
  total_schools?: number;
}

export interface DashboardFormStats {
  completedForms: number;
  pendingForms: number;
  approvalRate: number;
  total?: number;
  approved?: number;
  pending?: number;
  rejected?: number;
  draft?: number;
  dueSoon?: number;
  overdue?: number;
  completed?: number;
  percentage?: number;
  completion_rate?: number;
  completionRate?: number;
}

export interface SuperAdminDashboardData {
  stats: DashboardFormStats;
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  schools: {
    totalSchools: number;
    activeSchools: number;
    inactiveSchools: number;
  };
  sectors: {
    totalSectors: number;
    activeSectors: number;
    inactiveSectors: number;
  };
  regions: {
    totalRegions: number;
    activeRegions: number;
    inactiveRegions: number;
  };
}

export interface RegionAdminDashboardData {
  stats: DashboardFormStats;
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  sectors: SectorStat[];
}

export interface SectorAdminDashboardData {
  stats: DashboardFormStats;
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  schools: SchoolStat[];
}

export interface SchoolAdminDashboardData {
  stats: DashboardFormStats;
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
}

// Additional interfaces for component props
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
  categories?: CategoryItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  navigateToDataEntry: () => void;
  handleFormClick: (formId: string) => void;
  onCategoryChange?: (categoryId: string) => void;
}
