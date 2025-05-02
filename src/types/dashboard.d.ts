
import { ReactNode } from 'react';

// Dashboard tipləri üçün əsas interfeyslər
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  timestamp?: string;
  date?: string; // geriyə uyğunluq üçün
  type: 'info' | 'warning' | 'error' | 'success';
  read?: boolean;
  isRead?: boolean; // geriyə uyğunluq üçün
  priority?: string;
  createdAt?: string;
  entity?: string;
  target?: string;
}

// StatsCardProps interfeysi
export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string | ReactNode;
  description: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

// CompletionRateCardProps interfeysi
export interface CompletionRateCardProps {
  title: string;
  completionRate: number;
}

// NotificationsCardProps interfeysi
export interface NotificationsCardProps {
  title: string;
  notifications: DashboardNotification[];
}

// Status itemləri üçün
export interface StatsItem {
  title: string;
  count: number;
  description?: string;
  icon?: React.ReactNode;
  label?: string;
  value?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  change?: number;
}

// Gözləmədə olan elementlər üçün
export interface PendingItem {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  schoolName?: string;
  categoryName?: string;
  dueDate?: string;
  submittedAt?: string;
  school?: string;
  category?: string;
  completionPercentage?: number;
  description?: string;
}

// Form statusu enum
export enum FormStatus {
  ALL = 'all',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  EXPIRED = 'expired',
  DUE_SOON = 'dueSoon',
  OVERDUE = 'overdue',
  COMPLETED = 'completed'
}

// Form elementləri üçün
export interface FormItem {
  id: string;
  title: string;
  category?: string;
  date: string;
  status: FormStatus | string;
  completionPercentage: number;
  description?: string;
}

// Form statistikası interfeysi
export interface FormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  drafts: number;
  incomplete: number;
}

// Tamamlanma statistikası interfeysi
export interface CompletionStats {
  total: number;
  completed: number;
  percentage: number;
}

// Region statistikası interfeysi
export interface RegionStats {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  adminEmail?: string;
  status?: string;
  completionRate?: number;
}

// Sektor tamamlanma elementləri
export interface SectorCompletionItem {
  id: string;
  name: string;
  schoolCount: number;
  completionPercentage?: number;
  completionRate?: number;
}

// Kateqoriya statistikası interfeysi
export interface CategoryStat {
  id: string;
  name: string;
  completion?: CompletionStats;
  schoolCount?: number;
  completionPercentage?: number;
  deadline?: string;
  columnCount?: number;
  status?: string;
  completionRate?: number;
  schools?: number;
}

// Məktəb statistikası interfeysi
export interface SchoolStat {
  id: string;
  name: string;
  sector: string;
  sectorId?: string;
  region?: string;
  regionId?: string;
  completion?: CompletionStats;
  pendingCount?: number;
  formCount?: number;
  completionRate?: number;
  completionPercentage?: number;
}

// Diaqram məlumatları interfeysi
export interface ChartData {
  activityData: { name: string; value: number }[];
  regionSchoolsData: { name: string; value: number }[];
  categoryCompletionData: { name: string; completed: number }[];
}

// Aktivlik jurnalı elementi interfeysi
export interface ActivityLogItem {
  id: string;
  action: string;
  user: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  entity?: string;
  target?: string;
  details?: string;
  time?: string;
}

// Dashboard məlumatları interfeysləri
export interface SuperAdminDashboardData {
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  formsByStatus?: {
    pending?: number;
    approved?: number;
    rejected?: number;
    total?: number;
  };
  completionRate: number;
  pendingApprovals?: PendingItem[];
  regions?: RegionStats[];
  notifications: DashboardNotification[];
  categories?: CategoryStat[];
  regionCount?: number;
  sectorCount?: number;
  schoolCount?: number;
  userCount?: number;
  approvalRate?: number;
}

export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
  };
  pendingItems?: PendingItem[];
  categories?: CategoryStat[];
  sectors?: SectorCompletionItem[];
  sectorCompletions?: SectorCompletionItem[];
  pendingApprovals?: PendingItem[];
  notifications: DashboardNotification[];
  recentActivities?: ActivityLogItem[];
  completionRate: number;
  sectorStats?: {
    total: number;
    active: number;
  };
  schoolStats?: {
    total: number;
    active: number;
    incomplete: number;
  };
}

export interface SectorAdminDashboardData {
  stats: {
    schools: number;
    users?: number;
  };
  pendingItems?: PendingItem[];
  schools?: SchoolStat[];
  schoolsStats?: {
    total: number;
    active: number;
    incomplete: number;
  };
  schoolStats?: {
    total: number;
    active: number;
    incomplete: number;
  };
  categories?: CategoryStat[];
  completionRate: number;
  notifications: DashboardNotification[];
  activityLog?: ActivityLogItem[];
  recentActivities?: ActivityLogItem[];
}

export interface SchoolAdminDashboardData {
  formStats: FormStats;
  categories?: CategoryStat[];
  notifications: DashboardNotification[];
  forms?: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingForms?: FormItem[];
  completionRate: number;
  completion?: CompletionStats;
}

// Dashboard məlumatları tipi
export type DashboardData = 
  | SuperAdminDashboardData
  | RegionAdminDashboardData
  | SectorAdminDashboardData
  | SchoolAdminDashboardData;
