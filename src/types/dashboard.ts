
import { Notification } from './notification';

export interface StatsItem {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export interface ChartData {
  name: string;
  value: number;
}

export interface FormItem {
  id: string;
  title: string;
  date: string;
  status: string;
  completionPercentage: number;
}

export type FormStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface SchoolAdminDashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  notifications: Notification[];
  completionRate: number;
  pendingForms: FormItem[];
  recentlySubmitted: FormItem[];
  recentlyApproved: FormItem[];
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface SectorAdminDashboardData {
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  stats: StatsItem[];
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  schoolStats: {
    id: string;
    name: string;
    completionRate: number;
    pending: number;
  }[];
  pendingItems: {
    id: string;
    school: string;
    category: string;
    date: string;
  }[];
}

export interface RegionAdminDashboardData {
  sectors: number;
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  stats: StatsItem[];
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  sectorStats: {
    id: string;
    name: string;
    schoolCount: number;
    completionRate: number;
  }[];
}

export interface SuperAdminDashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  stats: StatsItem[];
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  regionStats: {
    id: string;
    name: string;
    sectorCount: number;
    schoolCount: number;
    completionRate: number;
  }[];
}

export type DashboardData = SuperAdminDashboardData | RegionAdminDashboardData | SectorAdminDashboardData | SchoolAdminDashboardData;
