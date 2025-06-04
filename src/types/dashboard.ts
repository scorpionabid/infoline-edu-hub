
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
  status: FormItemStatus;
  lastModified: string;
  completionRate: number;
}

export interface CategoryItem extends BaseEntity {
  name: string;
  status: CategoryStatus;
  completionRate: number;
}

export interface DeadlineItem extends BaseEntity {
  name: string;
  deadline: string;
  dueDate: string;
  status: DeadlineStatus;
  daysLeft: number;
}

export interface PendingApproval extends BaseEntity {
  schoolName: string;
  categoryName: string;
  date: string;
  status: 'pending';
}

export interface SchoolStat extends BaseEntity {
  name: string;
  completionRate: number;
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  status: EntityStatus;
  lastUpdated: string;
}

export interface SectorStat extends BaseEntity {
  name: string;
  schoolCount: number;
  totalSchools: number;
  activeSchools: number;
  completionRate: number;
  status: EntityStatus;
}

export interface DashboardFormStats {
  completedForms: number;
  pendingForms: number;
  approvalRate: number;
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
