
import { Notification } from './notification';

// Ümumi Dashboard Məlumatları Interfeysi
export interface DashboardData {
  completionRate?: number;
  pendingApprovals?: number;
  notifications?: Notification[];
  statistics?: {
    completionRate: number;
    pendingForms: number;
    totalSchools: number;
  };
}

// Super Admin Dashboard Məlumatları
export interface SuperAdminDashboardData extends DashboardData {
  regions: {
    total: number;
    active: number;
    inactive: number;
  };
  sectors: {
    total: number;
    active: number;
    inactive: number;
  };
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      superadmin: number;
      regionadmin: number;
      sectoradmin: number;
      schooladmin: number;
    };
  };
}

// Region Admin Dashboard Məlumatları
export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: {
    total: number;
    active: number;
    inactive: number;
  };
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      sectoradmin: number;
      schooladmin: number;
    };
  };
}

// Sektor Admin Dashboard Məlumatları
export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName: string;
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      schooladmin: number;
    };
  };
}

// Form statusları
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'due' | 'overdue';

// Form elementi
export interface FormItem {
  id: string;
  title: string;
  date: string;
  status: string;
}

// Məktəb Admin Dashboard Məlumatları
export interface SchoolAdminDashboardData extends DashboardData {
  schoolName: string;
  sectorName: string;
  regionName: string;
  forms: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  pendingForms: FormItem[];
}

// Statistik məlumat elementi
export interface StatsItem {
  title: string; 
  value: number | string;
  description?: string;
  increase?: boolean;
  percent?: number;
}

// Qrafik Məlumatları
export interface ChartData {
  activityData: Array<{name: string; value: number}>;
  regionSchoolsData: Array<{name: string; value: number}>;
  categoryCompletionData: Array<{name: string; value: number}>;
}
