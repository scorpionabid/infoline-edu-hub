
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
  // İstatistik elementlər və digər məlumatlar üçün genişlənmələr
  stats?: StatsItem[];
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
}

// Statistik məlumat elementi
export interface StatsItem {
  id?: string; // ID xüsusiyyətini əlavə edirik
  title: string; 
  value: number | string;
  description?: string;
  increase?: boolean;
  percent?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
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
  stats?: StatsItem[];
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
  stats?: StatsItem[];
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
  pendingSchools?: number;
  stats?: StatsItem[];
}

// Form statusları
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'due' | 'overdue';

// Form elementi
export interface FormItem {
  id: string;
  title: string;
  date: string;
  status: string;
  category?: string; // Kateqoriya xüsusiyyətini əlavə edirik
  completionPercentage?: number; // Tamamlanma faizi xüsusiyyətini əlavə edirik
  deadline?: string;
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
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

// EntityCount və UserEntityCount interfeyslərini əlavə edək (dashboardUtils.ts üçün)
export interface EntityCount {
  total: number;
  active: number;
  inactive: number;
}

export interface UserEntityCount extends EntityCount {
  byRole: {
    superadmin?: number;
    regionadmin?: number;
    sectoradmin?: number;
    schooladmin?: number;
  };
}

// Qrafik Məlumatları
export interface ChartData {
  activityData: Array<{name: string; value: number}>;
  regionSchoolsData: Array<{name: string; value: number}>;
  categoryCompletionData: Array<{name: string; completed?: number; value?: number}>;
}
