
import { AppNotification } from './notification';
import { SchoolStat } from './supabase';

export interface StatusSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  active?: number;
  inactive?: number;
  draft?: number;
}

export interface CompletionSummary {
  total: number;
  completed: number;
  percentage: number;
}

export interface FormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  draft?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number;
  status?: string;
}

export interface FormItem {
  id: string;
  name: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  deadline?: string;
  status: string;
  submittedAt?: string;
  updatedAt?: string;
  completionRate?: number;
  date?: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  name?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  deadline: string;
  daysRemaining: number;
  status: string;
  dueDate?: string;
  progress?: number;
  completionRate?: number;
}

export interface PendingApprovalItem {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  status: string;
  submittedAt: string;
  entries?: any[];
}

// Alias for backward compatibility
export type PendingApproval = PendingApprovalItem;

export interface DashboardData {
  completion: CompletionSummary;
  status: StatusSummary;
  formStats?: FormStats;
  completionRate?: number;
  notifications?: AppNotification[];
}

export interface SchoolAdminDashboardData extends DashboardData {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
}

export interface SectorAdminDashboardData extends DashboardData {
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApprovalItem[];
}

export interface RegionAdminDashboardData extends DashboardData {
  sectorStats: {
    id: string;
    name: string;
    completionRate: number;
    schoolCount: number;
    pendingApprovals: number;
  }[];
  pendingApprovals: PendingApprovalItem[];
}

export interface SuperAdminDashboardData extends DashboardData {
  regionStats?: {
    id: string;
    name: string;
    completionRate: number;
    sectorCount: number;
    schoolCount: number;
  }[];
  sectorStats?: {
    id: string;
    name: string;
    completionRate: number;
    schoolCount: number;
    pendingApprovals?: number;
  }[];
  schoolStats?: {
    id: string;
    name: string;
    completionRate: number;
    pendingCount: number;
    status?: string;
  }[];
  pendingApprovals?: PendingApprovalItem[];
  totalUsers?: number;
  totalSchools?: number;
  totalSectors?: number;
  totalRegions?: number;
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export interface SchoolAdminDashboardProps {
  data?: SchoolAdminDashboardData;
  schoolId?: string;
}

export interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export interface StatusCardsProps {
  status: StatusSummary;
  completion: CompletionSummary;
  formStats?: FormStats;
}

// Re-export these types from dashboard.d.ts for backward compatibility
export interface RegionStat {
  id: string;
  name: string;
  completionRate: number;
  sectorCount: number;
  schoolCount: number;
  status?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  schoolCount: number;
  pendingApprovals?: number;
  status?: string;
}

// Re-export the SchoolStat for component usage
export { SchoolStat };

