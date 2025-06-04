
import { AppNotification } from './notification';

export interface DashboardStatus {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  schools?: {
    total: number;
    active: number;
    inactive: number;
  };
  sectors?: {
    total: number;
    active: number;
    inactive: number;
  };
  regions?: {
    total: number;
    active: number;
    inactive: number;
  };
  users?: {
    total: number;
    active: number;
    inactive: number;
  };
}

export interface DashboardFormStats {
  totalForms: number;
  pendingForms: number;
  approvedForms: number;
  rejectedForms: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  completionRate: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'pending' | 'overdue';
}

export interface FormItem {
  id: string;
  name: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  lastModified: string;
  completionRate: number;
  submissions?: number;
  completion?: number;
  deadline?: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  name: string;
  deadline: string;
  description?: string;
  status?: 'upcoming' | 'overdue' | 'completed';
  daysLeft: number;
}

export interface PendingApproval {
  id: string;
  schoolName: string;
  categoryName: string;
  date: string;
  submittedAt?: string;
  created_at?: string;
  status?: 'pending' | 'approved' | 'rejected';
  description?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status: 'active' | 'inactive';
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  lastUpdated: string;
}

export interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  schoolCount?: number;
  studentCount?: number;
  totalSchools: number;
  activeSchools: number;
  status: 'active' | 'inactive';
}

export interface SchoolAdminDashboardData {
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  forms?: FormItem[];
  upcomingDeadlines?: DeadlineItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  pendingApprovals?: PendingApproval[];
  notifications?: AppNotification[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
}

export interface RegionAdminDashboardData {
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  forms?: FormItem[];
  upcomingDeadlines?: DeadlineItem[];
  pendingApprovals?: PendingApproval[];
  schoolStats?: SchoolStat[];
  notifications?: AppNotification[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
}

export interface SectorAdminDashboardData {
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  forms?: FormItem[];
  upcomingDeadlines?: DeadlineItem[];
  pendingApprovals?: PendingApproval[];
  schoolStats?: SchoolStat[];
  notifications?: AppNotification[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
}

export interface SuperAdminDashboardData {
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  forms?: FormItem[];
  upcomingDeadlines?: DeadlineItem[];
  pendingApprovals?: PendingApproval[];
  regionStats?: any[];
  sectorStats?: SectorStat[];
  schoolStats?: SchoolStat[];
  notifications?: AppNotification[];
}
