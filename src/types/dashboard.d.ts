
import { ReactNode } from 'react';

export interface DashboardProps {
  data?: any;
}

export interface StatusCount {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  active: number;
  inactive: number;
}

export interface CompletionStats {
  total: number;
  completed: number;
  percentage: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate?: number;
  status?: string;
  pendingCount?: number;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount?: number;
  completion?: number;
}

export interface PendingApproval {
  id: string;
  schoolName: string;
  categoryName: string;
  submittedAt: string;
}

export interface FormItem {
  id: string;
  name: string;
  category: string;
  dueDate: string;
  status: string;
  completionRate?: number;
}

export interface CategoryStats {
  id: string;
  name: string;
  completionRate: number;
  status: string;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

export interface SchoolAdminDashboardData {
  status: StatusCount;
  completion: CompletionStats;
  categories: CategoryStats[];
  upcoming: FormItem[];
  pendingForms: FormItem[];
  formStats?: DashboardFormStats;
  completionRate?: number;
  notifications?: any[];
}

export interface SectorAdminDashboardData {
  status: StatusCount;
  completion: CompletionStats;
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApproval[];
}

export interface RegionAdminDashboardData {
  status: StatusCount;
  completion: CompletionStats;
  sectorStats: SectorStat[];
  pendingApprovals: PendingApproval[];
}

export interface SuperAdminDashboardData {
  status: StatusCount;
  completion: CompletionStats;
  regionStats: any[];
  sectorStats: any[];
}

export interface FormTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  categories?: any[];
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  description?: string;
  trend?: number;
  trendDescription?: string;
  className?: string;
  isLoading?: boolean;
}
