
import { Notification } from "./notification";

export interface PendingApprovalItem {
  id: string;
  schoolName: string;
  categoryName: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RegionStats {
  id: string;
  name: string;
  totalSchools: number;
  schoolCount?: number;
  sectors: number;
  sectorCount?: number;
  completionRate: number;
}

export interface FormItem {
  id: string;
  categoryId?: string;
  categoryName: string;
  deadline: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  completionRate: number;
  submittedAt?: string;
}

export interface SchoolStats {
  id: string;
  name: string;
  completionRate: number;
  formsCompleted: number;
  formsTotal: number;
}

export interface SectorStats {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
  pendingApprovals: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalSchools: number;
  totalRegions: number;
  totalSectors: number;
  totalForms: number;
  totalCategories: number;
  completionRate: number;
  pendingApprovals: number;
}

export interface FormStatusStats {
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
}

interface BaseDashboardData {
  completionRate: number;
  stats?: any;
  notifications?: Notification[];
}

export interface SuperAdminDashboardData extends BaseDashboardData {
  stats: {
    totalUsers: number;
    totalSchools: number;
    totalRegions: number;
    totalSectors: number;
  };
  formsByStatus: FormStatusStats;
  regions?: RegionStats[];
  sectors?: SectorStats[];
  pendingApprovals?: PendingApprovalItem[];
}

export interface RegionAdminDashboardData extends BaseDashboardData {
  stats: {
    totalSchools: number;
    totalSectors: number;
    totalForms: number;
    totalCategories: number;
  };
  sectorStats: SectorStats[];
  schoolStats: SchoolStats[];
  pendingApprovals?: PendingApprovalItem[];
  formsByStatus?: FormStatusStats;
}

export interface SectorAdminDashboardData extends BaseDashboardData {
  stats: {
    totalSchools: number;
    totalForms: number;
    totalCategories: number;
    pendingApprovals: number;
  };
  schoolStats: SchoolStats[];
  pendingApprovals?: PendingApprovalItem[];
  recentActivities?: any[];
}

export interface SchoolAdminDashboardData extends BaseDashboardData {
  stats?: any;
  formStats: FormStatusStats;
  upcomingDeadlines: FormItem[];
  recentForms: FormItem[];
  pendingForms?: FormItem[];
  completedForms?: FormItem[];
}
