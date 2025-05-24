
import { AppNotification } from './notification';

export type DashboardRole = 'school-admin' | 'sector-admin' | 'region-admin' | 'super-admin';

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  active?: number;
  inactive?: number;
  new?: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
  completion?: number;
  completionRate?: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: string;
  deadline?: string;
  category?: string;
  priority?: string;
}

export interface DeadlineItem {
  id: string;
  name: string;
  deadline: string;
  category?: string;
  status?: string;
  type?: string;
}

export interface PendingApproval {
  id: string;
  title: string;
  type: string;
  submittedBy?: string;
  submittedAt: string;
  priority?: string;
  sectorName?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  totalForms?: number;
  pendingForms?: number;
  status?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  schoolCount?: number;
  pendingCount?: number;
  status?: string;
}

// Base dashboard data interface
export interface BaseDashboardData {
  status: DashboardStatus;
  formStats?: DashboardFormStats;
  notifications?: AppNotification[];
  pendingApprovals?: PendingApproval[];
  lastUpdated?: string;
}

// School admin specific data
export interface SchoolAdminDashboardData extends BaseDashboardData {
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
  categories?: CategoryItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
}

// Sector admin specific data
export interface SectorAdminDashboardData extends BaseDashboardData {
  schoolStats?: SchoolStat[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  };
  categories?: CategoryItem[];
  schools?: SchoolStat[];
}

// Region admin specific data
export interface RegionAdminDashboardData extends BaseDashboardData {
  sectorStats?: SectorStat[];
  schoolStats?: SchoolStat[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  };
  categories?: CategoryItem[];
  sectors?: SectorStat[];
}

// Super admin specific data
export interface SuperAdminDashboardData extends BaseDashboardData {
  regionStats?: any[];
  sectorStats?: SectorStat[];
  schoolStats?: SchoolStat[];
  systemHealth?: {
    status: string;
    uptime: number;
    issues?: string[];
  };
}

// Union type for all dashboard data
export type DashboardData = 
  | SchoolAdminDashboardData 
  | SectorAdminDashboardData 
  | RegionAdminDashboardData 
  | SuperAdminDashboardData;

// Props for dashboard components
export interface DashboardProps {
  role: DashboardRole;
  data: DashboardData;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
}
