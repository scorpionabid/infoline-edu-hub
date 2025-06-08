
import { BaseEntity } from './core';

// Status types
export type DashboardStatus = 'active' | 'pending' | 'completed' | 'draft';

// Common interfaces
export interface CategoryItem extends BaseEntity {
  name: string;
  status: string;
  completionRate: number;
}

export interface DeadlineItem extends BaseEntity {
  name: string;
  dueDate: string;
  status: string;
  deadline: string;
  daysLeft: number;
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
  completionRate: number;
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
}

export interface PendingApprovalItem extends BaseEntity {
  schoolName: string;
  regionName: string;
  categoryName: string;
  date: string;
}

export interface DashboardFormStats {
  completed: number;
  pending: number;
  total?: number;
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
